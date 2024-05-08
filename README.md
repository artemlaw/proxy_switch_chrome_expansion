### Proxy_switch
Расширение для интерактивной смена прокси пользователя.
В popup.js необходимо указать в переменную PROXY_DATA_SOURCE ссылку на google таблицу или иной источник возвращающий список прокси в виде json:
```json
    {
        "data":[
            {"name":"Иванов Иван","tel":88000000000,"proxy_host":"100.100.100.100","proxy_port":8000,"proxy_user":"test","proxy_password":"test","id":"0001"},
            {"name":"Петров Петр","tel":79009009090,"proxy_host":"101.101.101.101","proxy_port":8080,"proxy_user":"test","proxy_password":"test","id":"0002"}
        ],
        "error":false
    }
```
