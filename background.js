let profil = {}
verificationBuyer ()

function verificationBuyer () {
  //Очищаем правила блокировки 
  removeBlockRule() 
  //Проверяем есть ли в хранилище данные пользователя    
  chrome.storage.sync.get(['profil'], function (result) {
    //Пользователь в хранилище не определен
    if(!result.profil) {
      console.log('Пользователь не авторизирован - в хранилище не определен')
      setBlockRule()
      iconSet('off') 
    } else{
      console.log('profil', result.profil)
      profil = result.profil
      //Если найдено, то назначаем прокси  
      setProxy({id: profil.id, name: profil.name, tel: profil.tel, host: profil.proxy_host, port: profil.proxy_port, user: profil.proxy_user, password: profil.proxy_password})
    }
  })
}

function setProxy(obj) {   
  const config = {
    mode: "fixed_servers",
    rules: {
      proxyForHttps: {
        scheme: "http",
        host: obj.host,
        port: parseInt(obj.port),
      },
      bypassList: ['*google.com', 'chrome://newtab/', 'chrome://new-tab-page/']
    }
  }

  chrome.proxy.settings.set(
    {value: config, scope: 'regular'},
    function() {
      console.log('Прокси установлен', config)
      profil = {
        'profil_id': obj.id,
        'profil_name': obj.name,
        'profil_tel': obj.tel,
        'proxy_host': obj.host,
        'proxy_port': obj.port,  
        'proxy_user': obj.user,
        'proxy_password': obj.password
      }
      iconSet('on')
    }
  )   
}

function iconSet(str) {

  const icon = {
    path: 'icon/icon16.png',
  }
  if (str == 'off') {
    icon['path'] = 'images/icon16.png'
  }
  chrome.action.setIcon(icon)
}

//Установка правила блокировки
function setBlockRule() {
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      addRules:[{
      "id": 1,
      "priority": 1,
      "action": { "type": "block" },    
      "condition": {"resourceTypes": ["main_frame"] }}
      ],      
      removeRuleIds: [1]    
    }
  )
}

//Удаление правил блокировки
function removeBlockRule() {
  chrome.declarativeNetRequest.getDynamicRules(function (rules) {       
    if(rules) {
      rules.forEach((domain) => { 
        console.log('Удалено правило', domain)               
        chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: [domain.id]})
      })
    }
  })
}

function getProfil () {
  chrome.storage.sync.get(['profil'], function (result) {
    if(result.profil) {
      profil = result.profil
      console.log('Профиль из хранилища', profil)
    }  
  })  
}

chrome.storage.onChanged.addListener(
  (changes, areaName) => {
    console.log('Изменение в хранилище', changes)
    if (changes.profil) {
      console.log('Изменение profil')
      verificationBuyer ()
    }   
  }
)

chrome.webRequest.onAuthRequired.addListener(
  function(details, callbackFn) {
    
    console.log("onAuthRequired!", details.challenger)
    if(details.isProxy == true) {
      //вытащить профиль profil из хранилища и взять его данные: profil.proxy_user и profil.proxy_password
      getProfil()
      console.log({username: profil.proxy_user, password: profil.proxy_password}) 
      callbackFn({ 
        authCredentials: {'username': profil.proxy_user, 'password': profil.proxy_password}
      })
    } else {
      console.log(details) 
      callbackFn(
        console.log('Не используем токены авторизации, так как не прокси')
      )
    }
  },
  {urls: ["<all_urls>"]},  
  ['asyncBlocking']
)
