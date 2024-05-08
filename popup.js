const PROXY_DATA_SOURCE = 'https://script.google.com/macros/s/AKfycbyccpqfXKIoS7bPKdMUrLa5v7udWWCCpdwFMadvD_ubJ8lWmJxItZEAScov5V7APaWyUq/exec' // proxydata пример

const buyer_proxy = document.getElementById('buyer_proxy'),  
      btnShowBayerInput = document.getElementById('show_buyer_input'),
      showBayerInput = document.getElementById('row_buyer_id'),
      btnSetBayer = document.getElementById('buyer_save_id'),           
      inputBuyer = document.getElementById('inp_buyer_id'),      
      buyer = document.getElementById('buyer'),
      ready = document.getElementById('ready') 
      
function getSettings ()  {
  chrome.proxy.settings.get(
    {'incognito': false},
    function(config) {  
      if(config.value.rules !== undefined) { 
        getBuyer()
      } else {   
        ready.innerHTML = 'Расширение не готово' 
        buyer_proxy.innerHTML = ''
        buyer.innerHTML = `<a class="collection-item pink-text">Пользователь не авторизирован</a>`  
      }
    }
  )
} 

function getBuyer() {  
  chrome.storage.sync.get(['profil'], function (value) {  
    if(value.profil) {       
      ready.innerHTML = 'Расширение готово к работе'  
      buyer_proxy.innerHTML = `Прокси: ${value.profil.proxy_host}`
      buyer.innerHTML = `<a class="collection-item pink-text"><span class="badge purple darken-4 white-text">${value.profil.tel}</span>${value.profil.name} ${value.profil.id}</a>`
    } else { 
      ready.innerHTML = 'Расширение не готово' 
      buyer_proxy.innerHTML = ''
      buyer.innerHTML = `<a class="collection-item pink-text">Пользователь не авторизирован</a>`
      console.log('Не найден покупатель')      
    }
  })
}

function setBuyer(id) {
  chrome.storage.sync.set({'buyer_id': id}, function() {
    console.log('Buyer_id сохранен в хранилище', id) 
  })
}

getSettings ()

btnShowBayerInput.addEventListener("click", (e) =>{
  showBayerInput.classList.remove('hidden')
})

btnSetBayer.addEventListener("click", (e) =>{
  console.log(inputBuyer.value)
  const getData = async (url) => {
    const res = await fetch(url, {method: 'GET', headers: {'Content-type': 'application/json' }})
    if (!res.ok) {    
      throw Error(`Статус запроса к гугл ` + res.status)
    }  
    return await res.json() 
  } 
  getData (PROXY_DATA_SOURCE)
  .then(res => {
    console.log(res.data)    
    let buyers = []
    buyers = res.data
    //Ищем по полученным данным прокси   
    if (buyers.find(element => element.id == inputBuyer.value)) { 
      //сохраняем id пользователя
      setBuyer(inputBuyer.value)        
      //Если найдено, то сохраняем в профиль
      const profil = buyers.find(element => element.id == inputBuyer.value)   
        chrome.storage.sync.set({'profil': profil}, function() {
        console.log('Профиль сохранен в хранилище', profil)
      })                 
    } else {
      //Иначе очищаем профиль 
      console.log('Прокси для пользователя не определен')  
      chrome.storage.sync.remove(['profil'], () => {console.log('profil очищен')})  
    } 
  })
  .catch((err) => {console.log (err)})  

})

chrome.storage.onChanged.addListener(
  (changes, areaName) => {
    console.log('Изменение', changes)
    getSettings ()
  }
)
