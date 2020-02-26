// Функция get и post к серверу

function customHttp() {
  return {
    get(url, callback) {
      try {
        const request = new XMLHttpRequest();
        request.open('GET', url);
        request.addEventListener('load', () => {
          if (Math.floor(request.status / 100) !== 2) {
            callback(`Error. Status code: ${request.status}`, request);
            return;
          }
          const response = JSON.parse(request.responseText);
          callback(null, response);
        });

        request.addEventListener('error', () => {
          callback(`Error. Status code: ${request.status}`, request);
        });

        request.send();
      } catch (error) {
        callback(error);
      }
    },
    post(url, body, headers, callback) {
      try {
        const request = new XMLHttpRequest();
        request.open('POST', url);
        request.addEventListener('load', () => {
          if (Math.floor(request.status / 100) !== 2) {
            callback(`Error. Status code: ${request.status}`, request);
            return;
          }
          const response = JSON.parse(request.responseText);
          callback(null, response);
        });

        request.addEventListener('error', () => {
          callback(`Error. Status code: ${request.status}`, request);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            request.setRequestHeader(key, value);
          });
        }

        request.send(JSON.stringify(body));
      } catch (error) {
        callback(error);
      }
    },
  };
}

const http = customHttp();

//  Взаимодействие с сервисом

const newsService = (function () {
  const apiKey = '7dcfa74ca6154b03aefc37bb48084058';
  const apiUrl = 'http://newsapi.org/v2';

  return {
    topHeadlines(country = 'ru', callback) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`, callback);
    },
    everything(query, callback) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, callback);
    }
  };
})();

// Элементы

const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];

form.addEventListener('submit', e => {
  e.preventDefault();
  loadNews();
});


document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  loadNews();
});

// Функция загрузки новостей

function loadNews() {
  showLoader();

  const country = countrySelect.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newsService.topHeadlines(country, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

function onGetResponse(err, res) {
  removePreloader();
  if (err) {
    showAlert(err, 'error-msg');
    return;
  }

  if (!res.articles.length) {
    // пустое сообщение
    return;
  }

  renderNews(res.articles);
}

// Рендер новостей 

function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = '';

  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

// Очистка старых новостей при новом запросе

function clearContainer(container) {
  let child = container.lastElementChild;

  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

// Шаблон новости

function newsTemplate({
  urlToImage,
  title,
  url,
  description
}) {
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Читать далее...</a>
        </div>
      </div>
    </div>
  `;
}

function showAlert(msg, type = 'success') {
  M.toast({
    html: msg,
    classes: type
  });
}

// Прелоадер показать

function showLoader() {
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="progress">
    <div class="indeterminate"></div>
  </div>
  `);
}

// Прелоадер скрыт

function removePreloader() {
  const loader = document.querySelector('.progress');

  if (loader) {
    loader.remove();
  }
}