const exifParser = require('exif-parser');
const admin = require('firebase-admin');
const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};
const { google } = require('googleapis');
const hastags = require('../hastags.json');
const moment = require('moment');
const sharp = require('sharp');
const fs = require('fs');
admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: 'https://pixelate-app-e5126-default-rtdb.firebaseio.com/',
});
const storage = admin.storage();
const db = admin.database();
const bucketName = 'pixelate-app-e5126.appspot.com';
const bucket = storage.bucket(bucketName);
const sheets = google.sheets('v4');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const sheetCred = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};
const client = new google.auth.JWT(
    sheetCred.client_email,
    null,
    sheetCred.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);
function generateUniqueId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let uniqueId = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        uniqueId += characters.charAt(randomIndex);
    }
    return uniqueId;
}
async function addDataToFirebase(data) {
    const folderName = data.email.replaceAll('.', '--').replaceAll('@', '-');
    const exifData = JSON.parse(data.exifData);
    try {
        client.authorize(async function (err) {
            if (err) {
                console.error('Authentication failed:', err);
                return;
            }
            const uniqueId = generateUniqueId(11);
            const imageUrl = data.imageUrl[0];
            const hashtags = data.hashtags;
            const hashtagsList = hashtags.map((item) => {
                return item.replace('#', '').replaceAll(' ', '').replaceAll('\n', '');
            })
            let dateTime = 0;
            let width = 0;
            let height = 0;
            let aspectRatio = 0;
            let cameraMake = null;
            let cameraModel = null;
            let iso = 100;
            let aperture = 5.6;
            let focalLength = 0;
            let exposerTime = 1 / 100;
            let photoLocation = null;
            let photoCountry = null;
            let photoCity = null;
            let latitude = 0;
            let longitude = 0;
            if (exifData.tags.DateTimeOriginal) {
                dateTime = moment.unix(exifData.tags.DateTimeOriginal).format('YYYY-MM-DD HH:mm:ss');
            }
            if (exifData.imageSize.width) {
                width = exifData.imageSize.width;
            }
            if (exifData.imageSize.height) {
                height = exifData.imageSize.height;
            }
            if (height) {
                aspectRatio = width / height;
                aspectRatio = aspectRatio.toFixed(2);
            }
            if (exifData.tags.Make) {
                cameraMake = exifData.tags.Make;
            }
            if (exifData.tags.Model) {
                cameraModel = exifData.tags.Model;
            }
            if (exifData.tags.ISO) {
                iso = exifData.tags.ISO;
            }
            if (exifData.tags.ApertureValue) {
                aperture = exifData.tags.ApertureValue;
            }
            if (exifData.tags.focalLength) {
                focalLength = exifData.tags.FocalLength;
            }
            if (exifData.tags.ExposureTime) {
                exposerTime = exifData.tags.ExposureTime;
            }
            if (exifData.tags.GPSLatitude) {
                latitude = exifData.tags.GPSLatitude;
            }
            if (exifData.tags.GPSLongitude) {
                longitude = exifData.tags.GPSLongitude;
            }
            const EV = Math.log((aperture * aperture) / (exposerTime * (iso / 100))) / Math.log(2);
            const sp = await calculateTotalSellingPrice(EV, hashtagsList)
                .then((totalSellingPrice) => {
                    return totalSellingPrice;
                })
                .catch((error) => {
                    console.error('Error calculating total selling price:', error);
                });
            // const dataArray = [uniqueId, imageUrl, imageUrl, dateTime, 't', width, height, aspectRatio, , data.email.replace('@gmail.com', ''), , , cameraMake, cameraModel, iso, aperture, focalLength, exposerTime, EV, photoLocation, latitude, longitude, photoCountry, photoCity, , , , , , , , , , EV,]
            // const finalArray = dataArray.concat(hashtagsList)
            // Define the data you want to append
            // const values = [finalArray.map(item => item)];
            const firebaseData = {
                name: data.name,
                exifData: data.exifData,
                imageUrl: data.imageUrl,
                hashtags: hashtagsList,
                email: data.email,
                sp: sp,
                ev: EV
            };
            const newData = {
                id: uniqueId,
                user: data.email,
                imageUrl: imageUrl,
                av: aperture.toFixed(5),
                tv: exposerTime.toFixed(5),
                ev: EV.toFixed(5),
                sp: sp.toFixed(3)
            };
            db.ref(`/users/${folderName}`).push(firebaseData);
            db.ref(`/photos`).push(newData);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}
async function accessSpreadsheet() {
    try {
        const sheetsAPI = await sheets.spreadsheets.values;
        const spreadsheetId = '1tUX5QR7Ap47r6iIfdDHZsm4p8UoYw7jbxzSGRyt_bsk'; // Replace with your Google Spreadsheet ID
        const range = 'Hashtag Values!A3:XFD'; // Replace with the desired sheet and column
        const response = await sheetsAPI.get({
            auth: client,
            spreadsheetId,
            range,
        });
        const values = response.data.values;
        const data = values.map((value) => ({
            title: value[0],
            count: value[8] || 0,
            stdDv: value[5],
            desiredMean: value[6] || 0,
            utilityTokensLocked: value[7] || 0,
            avgPrice: value[7] / value[8] || 0
        }))
        db.ref(`/hashtags`).set(data);
    } catch (error) {
        console.error('Error:', error);
    }
}
function calculateTotalSellingPrice(photoEV, hashtagsData) {
    return Promise.all(
        hashtagsData.map((hashtag) => {
            return new Promise((resolve, reject) => {
                const userRef = db.ref(`/hashtags`);
                userRef.orderByChild("title").equalTo(hashtag).once('value')
                    .then((snapshot) => {
                        let sellingPrice = 0;
                        snapshot.forEach((childSnapshot) => {
                            const data = childSnapshot.val();
                            const hashEV = data.desiredMean;
                            const diffEV = hashEV - photoEV;
                            const rating = Math.max(1, 100 - (Math.abs(diffEV) / data.stdDv));
                            const averagePrice = data.avgPrice;
                            sellingPrice += (averagePrice * rating)/100;
                        });
                        resolve(sellingPrice);
                    })
                    .catch((error) => {
                        console.error('Error fetching data:', error);
                        reject(error);
                    });
            });
        })
    )
        .then((sellingPrices) => {
            // Sum up all the individual selling prices
            const totalSellingPrice = sellingPrices.reduce((total, price) => total + price, 0);
            return totalSellingPrice;
        });
}
async function accessHashtagSheet() {
    try {
        const sheetsAPI = await sheets.spreadsheets.values;
        const spreadsheetId = '1tUX5QR7Ap47r6iIfdDHZsm4p8UoYw7jbxzSGRyt_bsk'; // Replace with your Google Spreadsheet ID
        const range = 'Hashtag Values!A3:XFD'; // Replace with the desired sheet and column
        // const authClient = await auth.getClient();
        const response = await sheetsAPI.get({
            auth: client,
            spreadsheetId,
            range,
        });
        const values = response.data.values;
        // values.map(row => columnData.push(row));
        return values;
        // db.ref(`/hatsags`).set(columnData);
    } catch (error) {
        console.error('Error:', error);
    }
}
module.exports.get_dashboard = (req, res) => {
    res.render('home', {
        pageTitle: "Dashboard",
        hastags: hastags
    });
}
module.exports.get_profile = async (req, res) => {
    const user = res.locals.user;
    const email = user.email;
    const folderName = email.replaceAll('.', '--').replace('@', '-');
    const usersRef = db.ref(`users/${folderName}`);
    const cursor = req.query.cursor;
    const prev = req.query.prev;
    let query = usersRef.orderByKey();
    if (prev) {
        query = query.endBefore(prev).limitToLast(101);
    } else if (cursor) {
        query = query.startAfter(cursor).limitToFirst(101);
    } else {
        query = query.limitToFirst(101);
    }
    const snapshot = await query.once('value');
    const dataArray = [];
    snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        dataArray.push({ key: childSnapshot.key, ...data });
    });
    let nextCursor = null;
    let prevCursor = null;
    if (prev) {
        if (dataArray.length > 100) {
            nextCursor = prev;
            prevCursor = dataArray[0].key;
            dataArray.shift();
        } else {
            nextCursor = prev;
        }
    } else {
        if (dataArray.length > 100) {
            nextCursor = dataArray[dataArray.length - 1].key;
            dataArray.pop();
        }
        prevCursor = cursor;
    }
    res.render('profile', {
        pageTitle: 'Profile',
        datas: dataArray,
        count: dataArray.length,
        nextCursor,
        prevCursor,
        firstKey: dataArray.length ? dataArray[0].key : null
    });
}
module.exports.post_upload = async (req, res) => {
    const file = req.file;
    const hashtags = JSON.parse(req.body.hashtags);
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }
    const user = res.locals.user;
    const email = user.email;
    // Store the file in Firebase Storage
    const folderName = email.replaceAll('.', '--').replaceAll('@', '-');
    const fileName = Date.now() + '-' + file.originalname.replaceAll('.', '-');
    const fileRef = bucket.file(folderName + fileName);
    const imageUrl = await fileRef.getSignedUrl({ action: 'read', expires: '01-01-2030' });
    const hashtagsList = hashtags.map((item) => {
        return item.replace('#', '').replaceAll(' ', '').replaceAll('\n', '');
    })
    sharp(file.buffer)
        .resize({ width: 300 }) // Adjust the dimensions as needed
        .toBuffer()
        .then((resizedImageData) => {
            const uploadStream = fileRef.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });
            uploadStream.on('error', (err) => {
                console.error('Error uploading file:', err);
                res.status(500).send('Error uploading file.');
            });
            uploadStream.on('finish', () => {
                // Now, store the EXIF data and image URL in the Firebase Realtime Database
                const exifData = exifParser.create(file.buffer).parse();
                const serializedExifData = JSON.stringify(exifData);
                // Store the EXIF data and image URL in the database
                const data = {
                    name: fileName,
                    exifData: serializedExifData,
                    imageUrl: imageUrl,
                    hashtags: hashtags,
                    email: email
                }
                addDataToFirebase(data);
                res.redirect('/dashboard');
            });
            uploadStream.end(resizedImageData);
        })
        .catch((error) => {
            console.error('Error resizing image:', error);
            res.status(500).send('Internal Server Error');
        });
    hashtagsList.forEach((hashtag) => {
        updateHashtagCount(hashtag, 1);
    });
 }
module.exports.post_uploadMultiple = async (req, res) => {
  const files = req.files;
  const hashtags = JSON.parse(req.body.hashtagsMultiple);
  const user = res.locals.user;
  const email = user.email;

  const hashtagsList = hashtags.map((item) => {
    return item.replace('#', '').replaceAll(' ', '').replaceAll('\n', '');
  });

  for (const file of files) {
    // Store the file in Firebase Storage
    const folderName = email.replaceAll('.', '--').replaceAll('@', '-');
    const fileName = Date.now() + '-' + file.originalname.replaceAll('.', '-');
    const fileRef = bucket.file(folderName + fileName);
    const imageUrl = await fileRef.getSignedUrl({ action: 'read', expires: '01-01-2030' });

    sharp(file.buffer)
      .resize({ width: 300 }) // Adjust the dimensions as needed
      .toBuffer()
      .then((resizedImageData) => {
        const uploadStream = fileRef.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        uploadStream.on('error', (err) => {
          console.error('Error uploading file:', err);
          res.status(500).send('Error uploading file.');
        });

        uploadStream.on('finish', () => {
          // Now, store the EXIF data and image URL in the Firebase Realtime Database
          const exifData = exifParser.create(file.buffer).parse();
          const serializedExifData = JSON.stringify(exifData);

          // Store the EXIF data and image URL in the database
          const data = {
            name: fileName,
            exifData: serializedExifData,
            imageUrl: imageUrl,
            hashtags: hashtags,
            email: email,
          };

          addDataToFirebase(data);
        });

        uploadStream.end(resizedImageData);
      })
      .catch((error) => {
        console.error('Error resizing image:', error);
        res.status(500).send('Internal Server Error');
      });
  }

  hashtagsList.forEach((hashtag) => {
    updateHashtagCount(hashtag, files.length);
  });

  res.redirect('/dashboard');
};

 exports.get_postData = async (req, res) => {
     const user = res.locals.user;
     const email = user.email;
     const folderName = email.replaceAll('.', '--').replace('@', '-');
     const dataArray = [];
     const usersRef = db.ref(`users/${folderName}`);
    await usersRef.once('value')
        .then((snapshot) => {
            dataArray.length = 0;
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                dataArray.push(data);
            });
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
    res.render('getDetails', {
        pageTitle: 'Post',
        datas: dataArray.reverse(),
        count: dataArray.length
    });
};
module.exports.get_adminDashboard = async (req, res) => {
    const usersRef = db.ref('users');
    var documentNames;
    await usersRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            documentNames = Object.keys(snapshot.val());
        } else {
            console.warn('No documents found.');
        }
    }).catch((error) => {
        console.error('Error retrieving document names:', error);
    });
    const users = documentNames.map((user) => user.replaceAll('--', '.').replace('-', '@'));
    const totalImages = [];
    for (let user of documentNames) {
        const ref = db.ref(`users/${user}`);
        await ref.once('value', (snapshot) => {
            const totalCount = snapshot.numChildren();
            totalImages.push(totalCount);
        })
            .catch((error) => {
                console.error('Error counting documents:', error);
            });
    }
    //count hastags
    const totalHashtags = [];
    for (let user of documentNames) {
        const ref = db.ref(`users/${user}`);
        function countHashtags(document) {
            const hashtags = document.hashtags || []; // Assuming hashtags are stored as an array in the document
            return hashtags.length;
        }
        let totalHashtagsCount = 0;
        await ref.once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const document = childSnapshot.val();
                const documentHashtagsCount = countHashtags(document);
                totalHashtagsCount += documentHashtagsCount;
            });
        })
        totalHashtags.push(totalHashtagsCount);
    }
    // Calculate users sp
    let totalUserSP = [];
    for (let user of documentNames) {
        const ref = db.ref(`users/${user}`);
        const totalSP = await ref.once('value')
            .then((snapshot) => {
                let totalSP = 0;
                snapshot.forEach((childSnapshot) => {
                    const userData = childSnapshot.val();
                    if (userData && userData.sp) {
                        totalSP += userData.sp;
                    }
                });
                return totalSP;
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                throw error;
            });
        totalUserSP.push(totalSP);
    }
    const data = users.map((user, index) => ({
        id: index + 1,
        user,
        imageCount: totalImages[index],
        hashtagsCount: totalHashtags[index],
        totalSp: totalUserSP[index].toFixed(3)
    }));
    const userCount = data.length;
    res.render('admin/adminDashboard', {
        pageTitle: "Admin Dashboard",
        datas: data,
        usersCount: userCount
    });
}
module.exports.get_adminPhotos = async (req, res) => {
    const usersRef = db.ref('photos');
    const cursor = req.query.cursor;
    const prev = req.query.prev;
    let query = usersRef.orderByKey();
    if (prev) {
        query = query.endBefore(prev).limitToLast(101);
    } else if (cursor) {
        query = query.startAfter(cursor).limitToFirst(101);
    } else {
        query = query.limitToFirst(101);
    }
    const snapshot = await query.once('value');
    const data = [];
    snapshot.forEach((childSnapshot) => {
        data.push({ key: childSnapshot.key, ...childSnapshot.val() });
    });
    let nextCursor = null;
    let prevCursor = null;
    if (prev) {
        if (data.length > 100) {
            nextCursor = prev;
            prevCursor = data[0].key;
            data.shift();
        } else {
            nextCursor = prev;
        }
    } else {
        if (data.length > 100) {
            nextCursor = data[data.length - 1].key;
            data.pop();
        }
        prevCursor = cursor;
    }
    data.reverse();
    res.render('admin/adminPhotos', {
        pageTitle: "Admin Dashboard",
        datas: data,
        count: data.length,
        nextCursor,
        prevCursor,
        firstKey: data.length ? data[0].key : null
    });
}
module.exports.get_adminHashtags = async (req, res) => {
    const usersRef = db.ref('hashtags');
    const data = [];
    await usersRef.once('value')
        .then((snapshot) => {
            var val;
            snapshot.forEach((childSnapshot) => {
                val = childSnapshot.val();
                data.push(val);
            });
            // return val;
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
    res.render('admin/adminHashtags', {
        pageTitle: "Admin Dashboard",
        datas: data,
        count: data.length
    });
}
async function updateHashtagCount(hashtag, count) {
    const hashtagCountsRef = db.ref('hashtags');
    await hashtagCountsRef.orderByChild("title").equalTo(hashtag).once('value')
        .then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const currentCount = parseInt(childSnapshot.val().count) || 0;
                // Increment the count by 1
                const newCount = currentCount + count;
                // Update the count field
                childSnapshot.ref.update({
                    count: newCount.toString()
                });
                const newAvg = parseInt(childSnapshot.val().utilityTokensLocked) / newCount;
                // Update the Average field
                childSnapshot.ref.update({
                    avgPrice: newAvg.toString()
                });
                const prev = parseInt(currentCount / 100);
                const x = parseInt(newCount / 100);
                const diff = x - prev;
                if (diff) {
                    const currentTokens = parseFloat(childSnapshot.val().utilityTokensLocked) || 0;
                    const newTokens = currentTokens + diff * 10000;
                    childSnapshot.ref.update({
                        utilityTokensLocked: newTokens.toString()
                    });
                    const newAverage = newTokens / newCount;
                    // Update the Average field
                    childSnapshot.ref.update({
                        avgPrice: newAverage.toString()
                    });
                }
            })
        })
}

// --------- Data export helpers ---------
async function fetchPhotos() {
    const ref = db.ref('photos');
    const data = [];
    await ref.once('value')
        .then((snapshot) => {
            snapshot.forEach((child) => data.push(child.val()));
        })
        .catch((error) => console.error('Error fetching photos:', error));
    return data;
}

async function fetchHashtags() {
    const ref = db.ref('hashtags');
    const data = [];
    await ref.once('value')
        .then((snapshot) => {
            snapshot.forEach((child) => data.push(child.val()));
        })
        .catch((error) => console.error('Error fetching hashtags:', error));
    return data;
}

async function fetchUsersSummary() {
    const usersRef = db.ref('users');
    let documentNames = [];
    await usersRef.once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                documentNames = Object.keys(snapshot.val());
            }
        })
        .catch((error) => console.error('Error retrieving document names:', error));

    const users = documentNames.map((u) => u.replaceAll('--', '.').replace('-', '@'));

    const totalImages = [];
    for (let user of documentNames) {
        const ref = db.ref(`users/${user}`);
        await ref.once('value')
            .then((snap) => totalImages.push(snap.numChildren()))
            .catch((error) => console.error('Error counting documents:', error));
    }

    const totalHashtags = [];
    for (let user of documentNames) {
        const ref = db.ref(`users/${user}`);
        let count = 0;
        await ref.once('value', (snap) => {
            snap.forEach((child) => {
                const doc = child.val();
                const hashtags = doc.hashtags || [];
                count += hashtags.length;
            });
        });
        totalHashtags.push(count);
    }

    const totalUserSP = [];
    for (let user of documentNames) {
        const ref = db.ref(`users/${user}`);
        const sp = await ref.once('value')
            .then((snap) => {
                let t = 0;
                snap.forEach((child) => {
                    const userData = child.val();
                    if (userData && userData.sp) {
                        t += userData.sp;
                    }
                });
                return t;
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                return 0;
            });
        totalUserSP.push(sp);
    }

    return users.map((user, idx) => ({
        user,
        imageCount: totalImages[idx],
        hashtagsCount: totalHashtags[idx],
        totalSp: totalUserSP[idx]
    }));
}

module.exports.fetchPhotos = fetchPhotos;
module.exports.fetchHashtags = fetchHashtags;
module.exports.fetchUsersSummary = fetchUsersSummary;
