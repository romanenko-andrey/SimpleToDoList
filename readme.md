Приложение запущено здесь
https://todo-list-roand.herokuapp.com/

Описание:

Простой todo-list:
   - полностью адаптивное мобильное приложение
   - expressJS, ionicJS, angularJS
   - база данных MongoDB
   - многопользовательская поддержка (авторизация с помощью access-token)
   - два языка: RU:EN
   - полный перечень стандарных операций со списками дел:
     - добавление, изменение статуса и наименования, удаление\
   - краткая информация обо мне

установка базы данных MondoDB
>https://docs.mongodb.com/manual/installation/

запуск базы данных
набрать в корне
>$ mongod --dbpath=db

(после клона проекта не забыть создать в корне дирректорию для размещения файлов базы данных db/ иначе будет сообщение об ошибке )


для запуска приложения
набрать в корне
>$ npm start

для запуск приложение на локальном ПК
в браузере набрать 
>localhost:3000


для просмотра и редактирования базы данных
в отдельном окне терминала набрать
>$ mongo

помощь
> db.help()

открыть базу данных toDoLists
>use todolist

просмотреть существующие коллекции
>db.getCollectionNames()

просмотреть зарегестрированных пользователей
>db.users.find().pretty()

Для создания нового пользователя - отправить (при отладке можно через Postman) POST-запрос на localhost:3000/users/register
в теле запроса данные нового пользователя в формате JSON {"username": "newUser", "password": "123456"}

чтобы дать права администратора пользователю с именем admin
>db.users.update({username: "admin"}, {$set : {admin: true}})

Для входа в программу - отправить 
POST-запрос на localhost:3000/users/login
в теле запроса данные пользователя в формате JSON {"username": "newUser", "password": "123456"}
В ответ сервер сообщит:
{
  "status": "Идентификация успешно выполнена! Получите ключ доступа ...",
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZHJleSIsIl9pZCI6IjU3OWIxOGE4NThiZDg0MDQwN2VkMWQ2OCIsImFkbWluIjpmYWxzZSwiaWF0IjoxNDY5NzgyNDE2LCJleHAiOjE0Njk3ODYwMTZ9.g4zWyharFjGDKZ8oHabHyikNYmWgxRNwcM3Q6YjvSY0"
}
ключ token в дальнейшем используется для идентификации пользователя во всех его запросах в заголовке как
x-access-token = ключ