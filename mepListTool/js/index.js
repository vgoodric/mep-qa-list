/* eslint-disable no-unused-vars */
// functions for the mepListTool
console.log('mepListTool loaded');
function getCookie(cname) {
  var args = document.cookie.split(';');
  for (var i = 0; i < args.length; ++i) {
    var tmp = args[i].split(/=/);
    if (tmp[0] !== '' && cname === tmp[0].trim()) {
      return decodeURIComponent(tmp.slice(1).join('').replace('+', ' '));
    }
  }
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function toggleDarkMode() {
  if (document.body.classList.contains('dark-mode')) {
    document.body.classList.remove('dark-mode');
    setCookie('darkMode', 'off');
  } else {
    document.body.classList.add('dark-mode');
    setCookie('darkMode', 'on');
  }
  try {
    document.getElementById('qaGenerator').contentWindow.toggleDarkMode();
  } catch (e) {
    //nothing
  }
}

function goToPage() {
  try {
    const form = document.querySelector('.active.content .ui.form');
    let pageUrl = new URL(form.querySelector('input[name="page-url"]').value);
    const params = []
    form.querySelectorAll('.radio.checked input').forEach((input) => {
      if (input.value !== 'noload') {
        const manifestUrl = new URL(input.name);
        params.push(`${manifestUrl.pathname}--${input.value}`);
      }
    });
    if (params.length) pageUrl.searchParams.append('mep', params.join('---'));
    if (form.querySelector('.checkbox.checked')) pageUrl.searchParams.append('mepHighlight', 'true');

    window.open(pageUrl, '_blank');
  } catch (e) {
    console.error(e);
  }
}

function filterPages() {
  setTimeout(() => {
    const filterType = $('#choose-filter-method .checkbox.checked input').val();
    setCookie('filterType', filterType);
    $('.filter-type').removeClass('active');
    $(`.filter-type[data-filter-type="${filterType}"]`).addClass('active');
    if (filterType === 'dropdown') {
      const page = $('#page-dropdown .ui.dropdown').dropdown('get value');
      let geoVal = $('#geo-dropdown .ui.dropdown').dropdown('get value');
      const geoArr = geoVal.split(' ');
      const geo = geoArr[0];
      const geoOrRegion = geoArr[1] || 'geo';
      setCookie('page', page);
      setCookie('geo', geoVal);
      document.querySelectorAll('[data-page]').forEach((el) => {
        if ((el.dataset.page === page || !page) && (!geo || ((geoOrRegion === 'geo' && el.dataset.geo === geo) || (geoOrRegion === 'region' && el.dataset.region === geo)))) {
          el.classList.remove('hidden');
        } else {
          el.classList.remove('active');
          el.classList.add('hidden');
        }
      });
      return;
    }
    const filterString = document.getElementById('page-filter').value.trim();
    setCookie('filterString', filterString);
    document.querySelectorAll('[data-url]').forEach((el) => {
      if (el.dataset.url.includes(filterString) || !filterString) {
        el.classList.remove('hidden');
      } else {
        el.classList.remove('active');
        el.classList.add('hidden');
      }
    });
  }, 500);
}

function filterPagesByDropdown() {
  const page = $('#page-dropdown .ui.dropdown').dropdown('get value');
  let geoVal = $('#geo-dropdown .ui.dropdown').dropdown('get value');
  const geoArr = geoVal.split(' ');
  const geo = geoArr[0];
  const geoOrRegion = geoArr[1] || 'geo';
  setCookie('page', page);
  setCookie('geo', geoVal);
  document.querySelectorAll('[data-page]').forEach((el) => {
    if ((el.dataset.page === page || !page) && (!geo || ((geoOrRegion === 'geo' && el.dataset.geo === geo) || (geoOrRegion === 'region' && el.dataset.region === geo)))) {
      el.classList.remove('hidden');
    } else {
      el.classList.remove('active');
      el.classList.add('hidden');
    }
  });
}
function filterPagesByText() {
  const filterString = document.getElementById('page-filter').value.trim();
  setCookie('filterString', filterString);
  document.querySelectorAll('[data-url]').forEach((el) => {
    if (el.dataset.url.includes(filterString) || !filterString) {
      el.classList.remove('hidden');
    } else {
      el.classList.remove('active');
      el.classList.add('hidden');
    }
  });
}

// initialize page
$('#page-dropdown .ui.dropdown').dropdown();
$('#geo-dropdown .ui.dropdown').dropdown();
// $('#page-dropdown .ui.dropdown').dropdown().on('change', filterPages);
// $('#geo-dropdown .ui.dropdown').dropdown().on('change', filterPages);


if (getCookie('darkMode') === 'on') document.body.classList.add('dark-mode');

$('#choose-filter-method .checkbox').on('change', filterPages);
document.getElementById('page-filter').addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    filterPages();
  }
});
// build list of pages and manifests
$.ajax({
  async: false,
  global: false,
  url: '/mepListTool/data.json',
  dataType: 'json',
  success: function(data) {
    const pages = data?.[0];
    Object.keys(pages).sort().forEach((pageUrl) => {
      const datasets = `data-url="${pageUrl}" data-page="${pages[pageUrl].page}" data-geo="${pages[pageUrl].geo}" data-region="${pages[pageUrl].region}"`;
      const title = $(`<div class="title" ${datasets}><i class="dropdown icon"></i>${pageUrl}</div>`);
      const content = $(`<div class="content" ${datasets}><h4>Manifests:</h4></div>`);
      const form = $(`<div class="ui form"><input type="hidden" name="page-url" value="${pageUrl}" /></div>`);
      content.append(form);
      const page = pages[pageUrl];
      Object.keys(page.manifests).forEach((manifestUrl) => {
        const manifest = page.manifests[manifestUrl];
        const groupedFields = $(`<div class="grouped fields"><label>${manifestUrl}</label><div><i>Last seen on: ${manifest.lastSeen}</i></div></div>`);
        if (manifest.targetActivity) groupedFields.append(`<div><i>Target Activity: ${manifest.targetActivity}</i></div>`);
        if (manifest.on) {
          groupedFields.append(`<div><i>On: ${manifest.on}</i></div>`);
          groupedFields.append(`<div><i>Off: ${manifest.off}</i></div>`);
        }
        manifest.variants.forEach((variant) => {
          groupedFields.append(`<div class="field">
            <div class="ui radio checkbox">
              <input type="radio" value="${variant}" name="${manifestUrl}">
              <label>${variant}</label>
            </div>
          </div>`);
        });
        groupedFields.append(`<div class="field">
          <div class="ui radio checkbox">
            <input type="radio" value="default" name="${manifestUrl}">
            <label>Default (control)</label>
          </div>
        </div>
        <div class="field">
          <div class="ui radio checkbox">
            <input type="radio" value="noload" name="${manifestUrl}" checked="checked">
            <label>Don't force manifest load</label>
          </div>
        </div>`);
        form.append(groupedFields);
      });
      form.append(`<div class="grouped fields">
          <div class="field">
            <div class="ui checkbox">
              <input type="checkbox" name="highlight-updates" class="hidden" />
              <label>Turn on highlighting for page changes</label>
            </div>
          </div>
        </div>
        </div>
        <div class="grouped fields">
          <div class="field">
            <div class="ui icon buttons">
              <button class="blue ui button" onclick="goToPage()"><i class="arrow alternate circle right outline icon"></i> Open page in new tab</button>
            </div>
          </div>
        </div>`);
      $('.accordion').append(title).append(content);          
    });
    $('.ui.accordion').accordion();
    $('.ui.checkbox').checkbox();
  }
});

