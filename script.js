const userID = "userID"
let tagNameToColor = {}


//signup
$("#signupForm").submit(function (e) { 
    e.preventDefault();

    let nameValidated = validateNotEmpty("name")
    let emailValidated = validateNotEmpty("email")
    let passwordValidated = validateNotEmpty("password")
    let passwordLengthValidated = validateLength("password", 8)
    if ((nameValidated && emailValidated && passwordValidated && passwordLengthValidated) != true){
        return false;
    }
    let submitObject  = {
        "name": $("#name").val(),
        "email": $("#email").val(),
        "password": $("#password").val()

    }

    $.ajax({
        type: "post",
        url: "http://todo.reworkstaging.name.ng/v1/users",
        data: submitObject,
        dataType: "json",
        success: function (res) {
            notYetSuccess(res, "Account created successfully")
        },
        error: function (err) {
            alert(err.responseJSON.msg)
        }
    });
});

//validate that a field is not empty
function validateNotEmpty(className) {
    if(!$("#"+className).val()){
        $("#"+className).addClass("error")
        return false
    }
    else{
        $("#"+className).removeClass("error")
        return true
    }
}

//validate number of characters
function validateLength(className, length){
    if($("#"+className).val().length < length){
        $("#"+className).addClass("error")
        // alert(className + " must be at least " + length + "characters")
        return false

    }
    else{
        $("#"+className).removeClass("error")
        return true

    }
}

//login
$("#loginForm").submit(function (e) { 
    e.preventDefault();

    let emailValidated = validateNotEmpty("email")
    let passwordValidated = validateNotEmpty("password")

    if ((emailValidated && passwordValidated) != true){
        return false;
    }

    let submitObject  = {
        "email": $("#email").val(),
        "password": $("#password").val()

    }

    $.ajax({
        type: "post",
        url: "http://todo.reworkstaging.name.ng/v1/users/login",
        data: submitObject,
        dataType: "json",
        success: function (res) {
            let {success, response} = notYetSuccess(res, "Login successful")
            if(success){
                storeUserId(response.id)
                window.location.href = "./homepage.html"
            }
        },
        error: function (err) {
            alert(err.responseJSON.msg)
        }
    });

})

//creating an existing user again
//giving response code for 200 when status is a different thing
//if user doesnt exist, it still returns successful
//tag names are not unique but are being sent back within tasks so im not able to get the particular tag if its more than one

//manual bypass for endpoint returning non-200 status within response
function notYetSuccess(res, message) {
    if (typeof res.code === 'undefined' || res.code === 200) {
        alert(message)
        return {
            success: true, 
            response: res
        }
    } else {
        alert(res.msg)
        return {
            success: false, 
            response: {}
        }
    }
}

//log out
$("#logout").click(function (e) { 
    e.preventDefault();
    clearUserId()
    window.location.href = "./index.html"
});

//show add todo menu
function addTodo(){

    $("#showaddtodo").show()
    $("#cancel").click(function (e) { 
        e.preventDefault();
        $("#showaddtodo").hide()
        $("#entirepage").removeClass("backgroundChange");

        $("#addnewtodo").val("")
        $("#description").val("")

    });

    $("#entirepage").addClass("backgroundChange");
}

//show add category menu
function addCategory(){
    $("#showaddcategory").show()
    $("#cancell").click(function (e) { 
        e.preventDefault();
        $("#showaddcategory").hide()
        $("#entirepage").removeClass("backgroundChange");

    });

    $("#entirepage").addClass("backgroundChange");
}

function storeUserId(id) {
    localStorage.setItem(userID, id)
}

function clearUserId() {
    localStorage.removeItem(userID)
}

function getUserId() {
    let foundId = localStorage.getItem(userID)
    return {
        success: foundId !== null,
        userID: foundId
    }
}

//get existing categories for a user
function getUserCategories(id){
    $.ajax({
        type: "get",
        url: `http://todo.reworkstaging.name.ng/v1/tags?user_id=${id}`,
        dataType: "json",
        success: function (res) {
            addAllCategories(res)
        },
        error: function (err) {
            alert(err.responseJSON.msg)
        }
    });
}

//get all categories for an existing user
function getCategories() {
    let {success, userID} = getUserId()
    if (success) {
        getUserCategories(userID)
    }
}

//render all categories
function addAllCategories(tagObjects) {
    let categoryListNode = $('#categoryList')
    let taskTagsListnodes = $("#taskTags")
    categoryListNode.empty()
    taskTagsListnodes.empty()

    tagObjects.forEach(tagObject => {
        let color = tagObject.color
        let name = tagObject.title
        let id = tagObject.id
        tagNameToColor[name] = color
        //names have to be unique else it will override!! return the id

        categoryListNode.append(`<div class="p" >` + 
        `<div class="circles" style="background: ${color}">` + '</div>' +
        `<div class="div">${name}</div>` +
        `<div class="deleteTag"> <i class="fa fa-trash " id=${id} aria-hidden="true"></i> </div>` +
        '</div>');

        taskTagsListnodes.append(`<option value=${id}> ${name} </option>`)
    });
}

//add new category
function addNewCategory(){
    if(!$("#category").val() || !$("#color").val()){
        alert("Please add a category and color")
    }
    
    else{
        let {success, userID} = getUserId()
        if (success) {
            let submitObject  = {
                "user_id": userID,
                "title": $("#category").val(),
                "color": $("#color").val()
            }
    
            $.ajax({
                type: "post",
                url: "http://todo.reworkstaging.name.ng/v1/tags",
                data: submitObject,
                dataType: "json",
                success: function (res) {
                    getUserCategories(userID)
                },
                error: function (err) {
                    alert(err.responseJSON.msg)
                }
            });
        }
        $("#category").val("")
    }
}

//delete category
$("#categoryList").on('click', '.deleteTag', function (e) { 
    e.preventDefault();
    let id = e.target.id
    // console.log(e, id);
    $.ajax({
        type: "delete",
        url: `http://todo.reworkstaging.name.ng/v1/tags/${id}`,
        dataType: "json",
        success: function (response) {
            // alert(`deleted tag and its tasks`)
            getTagsAndTasks()
        }
    });
});

//get existing tasks for a user
function getUserTasks(id){
    $.ajax({
        type: "get",
        url: `http://todo.reworkstaging.name.ng/v1/tasks?user_id=${id}`,
        // data: "data",
        dataType: "json",
        success: function (response) {
            console.log(response);
            addAllTasks(response)
        },
        error: function (err) {
            alert(err)
        }
    });
}

//get tasks for an existing user
function getTasks(){
    let {success, userID} = getUserId()
    if (success){
        getUserTasks(userID)
    }
}

//render all tasks
function addAllTasks(tasksObjects) {
    let taskListNode = $('#mainTasks')
    taskListNode.empty()

    tasksObjects.forEach(tasksObject => {
        let title = tasksObject.title
        let description = tasksObject.content
        let checked = ""
        let line = checked
        if(tasksObject.completed) {
           checked = "checked"
           line = "line"
        }
        let id = tasksObject.id
        let color = tagNameToColor[tasksObject.tag]

        taskListNode.append(
            `<div class="grid-items"> 
                <div class="flex space-between">
                    <h2 class = "${line}"> ${title} </h2>
                    <h2 class="ed" id=${id}>...</h2>
                </div>
                <div class="showED showED-${id}">
                        <p class="editTask" id=${id}>Edit</p>
                        <p class="deleteTask" id=${id}>Delete</p>
                </div>
                <p class="desc ${line}"> ${description} </p>
                <div class="small-circles circles" style="background: ${color}"></div>
                <div class="checkbox">
                    <input ${checked} id=${id} class="done-check" type="checkbox" name="done">
                    <p>Done</p>
                </div>
            </div>`
        
        );

    });
}

//mark tasks as completed/checked
$("#mainTasks").on('click', '.done-check', function (e) { 
    e.preventDefault();
    let id = e.target.id


    let submitObject  = {
        completed: e.target.checked
    }

    $.ajax({
        type: "put",
        url: `http://todo.reworkstaging.name.ng/v1/tasks/${id}/set-completed`,
        dataType: "json",
        data: submitObject,
        success: function (response) {
            // alert(`deleted tag and its tasks`)
            getTasks()
        }
    });
});

//show delete and edit menu
$("#mainTasks").on('click', '.ed', function (e) { 
    e.preventDefault();
    let id = e.target.id
    // console.log(id);
    $(`.showED-${id}`).toggle();
});

//delete tasks
$("#mainTasks").on('click', '.deleteTask', function (e) { 
    e.preventDefault();
    let id = e.target.id
    // console.log(e, id);
    $.ajax({
        type: "delete",
        url: `http://todo.reworkstaging.name.ng/v1/tasks/${id}`,
        dataType: "json",
        success: function (response) {
            // alert(`deleted tag and its tasks`)
            getTasks()
        }
    });
});

function addNewTodo(){
    if(!$("#addnewtodo").val()){
        alert("Please add a todo")
    }
    else if(!$("#description").val()){
        alert("Please add a description")
    }
    else{
        let {success, userID} = getUserId()
        if (success) {
            let submitObject  = {
                "tag_id": userID,
                "title": $("#addnewtodo").val(),
                "content": $("#description").val()
            }
    
            $.ajax({
                type: "post",
                url: "http://todo.reworkstaging.name.ng/v1/tasks",
                data: submitObject,
                dataType: "json",
                success: function (res) {
                    getUserTasks(userID)
                },
                error: function (err) {
                    alert(err.responseJSON.msg)
                }
            });
        }
        $("#addnewtodo").val("")
        $("#description").val("")
    }
}

//get all tasks and categories
function getTagsAndTasks(){
    getCategories()
    getTasks()
}

