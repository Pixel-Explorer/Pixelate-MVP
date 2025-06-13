document.addEventListener('DOMContentLoaded', () => {
  const downloadButton = document.getElementById('downloadButton');
  if (!downloadButton) return;

  downloadButton.addEventListener('click', async (event) => {
    event.preventDefault();

    let url = '/export/users.csv';
    let fileName = 'users.csv';
    const path = window.location.pathname;
    if (path.includes('photos')) {
      url = '/export/photos.csv';
      fileName = 'photos.csv';
    } else if (path.includes('hashtags')) {
      url = '/export/hashtags.csv';
      fileName = 'hashtags.csv';
    }

    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  });
});

