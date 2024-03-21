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

$("#logout").click(function (e) { 
    e.preventDefault();
    clearUserId()
    window.location.href = "./index.html"
});

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

function addCategory(){
    $("#showaddcategory").show()
    $("#cancell").click(function (e) { 
        e.preventDefault();
        $("#showaddcategory").hide()
        $("#entirepage").removeClass("backgroundChange");

    });

    $("#entirepage").addClass("backgroundChange");
}


const userID = "userID"

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

function getCategories() {
    let {success, userID} = getUserId()
    if (success) {
        getUserCategories(userID)
    }
}

let tagNameToColor = {}

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

//working fine

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

function getTasks(){
    let {success, userID} = getUserId()
    if (success){
        getUserTasks(userID)
    }
}

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
                        <p>Edit</p>
                        <p>Delete</p>
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

$("#mainTasks").on('click', '.ed', function (e) { 
    e.preventDefault();
    let id = e.target.id
    // console.log(id);
    $(`.showED-${id}`).toggle();
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


function getTagsAndTasks(){
    getCategories()
    getTasks()
}


function onCheck(){


    // $(".checkbox").toggleClass("line");

    // if ($(".done-check").is(":checked")){
        $(".grid-items h2").toggleClass("line");
        $(".grid-items .desc").toggleClass("line");

        // console.log($(".checkbox"));
        // console.log(this.parent());
        console.log("test");
    // }

}

$(".ed").click(function (e) { 
    e.preventDefault();
    $(".showED").toggle();
    
});






