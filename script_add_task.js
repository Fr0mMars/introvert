//получение всех контактов в виде массива
let contactsList;
function getContacts() {
  contactsList = [];
  return fetch('/api/v4/contacts')
    .then(response => response.json())
    .then(data => {
      data['_embedded']['contacts'].forEach(function (item) {
        contactsList.push(item['id']);
      });
    }).catch(() => console.log('fail'))
}

//получение контактов со сделками в виде массива
let contactsListWithLeads;
function getContactsWithLeads() {
  contactsListWithLeads = [];
  return fetch('/api/v4/leads?with=contacts')
    .then(response => response.json())
    .then(data => {
      data['_embedded']['leads'].forEach(function (item) {
        item['_embedded']['contacts'].forEach(function (item) {
          contactsListWithLeads.push(item['id']);
        });
      });
    }).catch(() => console.log('fail'))
}

//вычесление контактов без сделок в виде массива
let contactsListWithoutLeads;
function computeContactsWithoutLeads(contactsList, contactsListWithLeads) {
  contactsListWithoutLeads = [];
  let tempArrWithLeads = Array.from(new Set(contactsListWithLeads));
  contactsListWithoutLeads = contactsList.filter(item => !tempArrWithLeads.includes(item));
}

//создание тела запроса для отправки задач
let taskDataUnits;
function createTaskData(contactsListWithoutLeads) {
  taskDataUnits = [];
  contactsListWithoutLeads.forEach(function (item) {
    taskDataUnits.push({
      text: "Контакт без сделок",
      complete_till: 1588885140,
      entity_id: item,
      entity_type: "contacts",
    });
  });
}

//создание новой задачи
function createNewTask(taskDataUnits) {
  let taskData = taskDataUnits;
  fetch('/api/v4/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  }).catch(() => console.log('fail'))
}

getContacts()
  .then(response => getContactsWithLeads())
  .then(response => computeContactsWithoutLeads(contactsList, contactsListWithLeads))
  .then(response => {
    computeContactsWithoutLeads(contactsList, contactsListWithLeads);
    createTaskData(contactsListWithoutLeads);
    return createNewTask(taskDataUnits);
  }).catch(() => console.log('fail'))