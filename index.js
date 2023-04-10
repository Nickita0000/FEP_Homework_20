const BTN_EDIT = '.buttonChange'
const BTN_DELETE = '.buttonDelete'
const DATA_USER = '.user'

const $contactList = $('#contactList')
const $form = $('#userForm')
let initialList = []

$form
    .on('submit', onFormSubmit)

$contactList
    .on('click', BTN_DELETE,onDeleteButtonClick)
    .on('click', BTN_EDIT,onEditButtonClick)

UsersListAPI
    .getList()
    .then((list) => {
        renderServerList(list)
        initialList = list
    })
    .catch(e => showError(e))

function onFormSubmit(e) {
    e.preventDefault()

    const contact = getPersonData()

    if(!isPersonDataValid(contact)) {
        showError(new Error('Введите корректные данные!'))
        return
    }

    if(contact.id){
        UsersListAPI
            .updateUser(contact.id, contact)
            .then((newContact) => {
                replaceContact(contact.id, newContact)
                clearForm()
                initialList = initialList.map(contactItem => contactItem.id === contact.id ? newContact : contactItem)
            })
            .catch(e => showError(e))
    } else {
        UsersListAPI
            .createUser(contact)
            .then((newContact) => {
                renderUsersList(newContact)
                clearForm()
                initialList = initialList.push(newContact)
            })
            .catch(e => showError(e))
    }
}

function onDeleteButtonClick(e) {
    const target = e.target
    const currentContact = findClickElement(target)
    const indexOfSelectedElem = currentContact.dataset.id

    UsersListAPI
            .deleteUser(indexOfSelectedElem)
            .catch(e => showError(e))
        currentContact.remove()
        initialList = initialList.filter(contactItem => contactItem.id !== indexOfSelectedElem)
}

function onEditButtonClick(e) {
    const indexOfSelectedElem = findIndexOfSelectedElem(e)
    const contact = findUserById(indexOfSelectedElem)

    fillForm(contact)
}

function findIndexOfSelectedElem(event) {
    const target = event.target
    const currentContact = findClickElement(target)
    return currentContact.dataset.id
}
function findClickElement(area) {
    return area.closest(DATA_USER)
}

function findUserById(id) {
    return initialList.find(contact => contact.id === id)
}

function replaceContact(id, contact) {
    const $initContact = $(`[data-id="${id}"]`)
    const newContactItem = htmlUser(contact)

    $initContact.replaceWith(newContactItem)
}

function fillForm(contact) {
    $('#id').val(contact.id)
    $('#inputName').val(contact.name)
    $('#inputSurname').val(contact.surname)
    $('#inputPhone').val(contact.phone)
}


function getPersonData() {
    const id = $('#id').val()
    const contact = findUserById(id) || {}

    return {
        ...contact,
        name : $('#inputName').val(),
        surname : $('#inputSurname').val(),
        phone : $('#inputPhone').val()
    }
}

function isPersonDataValid(person) {
    return (person.name !== '') && (person.surname !== '') && (person.phone !== '') && (isNaN(person.phone) === false)
}

function renderUsersList(contact) {
    const html = htmlUser(contact)

    $contactList.append(html)
}

function renderServerList(list) {
    const htmlServerEL = list.map(htmlUser)

    $contactList.html(htmlServerEL)
}

function htmlUser(contact) {
    return `
    <tr class="user" data-id="${contact.id}">
        <td class="user__name">${contact.name}</td>
        <td class="user__surname">${contact.surname}</td>
        <td class="user__phone">${contact.phone}</td>
        <td>
            <button class="buttonChange">Edit</button>
            <button class="buttonDelete">Delete</button>
        </td>
    </tr>
    `
}

function clearForm() {
    $form.trigger("reset")
}

function showError(e) {
    alert(e.message)
}

