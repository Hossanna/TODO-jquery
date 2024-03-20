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
                window.location.href = "/homepage.html"
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

function addAllCategories(tagObjects) {
    let categoryListNode = $('#categoryList')
    let taskTagsListnodes = $("#taskTags")
    categoryListNode.empty()
    taskTagsListnodes.empty()

    tagObjects.forEach(tagObject => {
        let color = tagObject.color
        let name = tagObject.title
        let id = tagObject.id

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

$("#logout").click(function (e) { 
    e.preventDefault();
    clearUserId()
    window.location.href = "/index.html"
});


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
            getCategories()
        }
    });
});

//working fine



function addNewTodo(){
    if(!$("#addnewtodo").val()){
        alert("Please add a todo")
    }
    else if(!$("#description").val()){
        alert("Please add a description")
    }
    else{
        let newTitle = $("#addnewtodo").val()
        let newDesc = $("#description").val()

        let userTodo = JSON.parse(localStorage.getItem('formData')) || [];

        let allData = {
            title: newTitle,
            description: newDesc,
        };

        userTodo.push(allData);

        localStorage.setItem('formData', JSON.stringify(userTodo));

        // alert($("#addnewtodo").val() + "\n" + $("#description").val())
        $("#main").append(
        '<div class="grid-items">' + 
            '<div class="flex space-between">'+
                '<h2>' + $("#addnewtodo").val() + '</h2>' +
                '<h2 class="ed" onclick={showEditDelete()}>'+ "..."  + '</h2>' +
            '</div>' +
            '<div class="showED" id="showED">'+
                '<p>' + "Edit" + '</p>' +
                '<p>'+ "Delete"  + '</p>' +
            '</div>' +
            '<p class="desc">' + $("#description").val() + '</p>' +
            '<div class="checkbox">' + 
                '<input onclick={onCheck()} class="done-check" type="checkbox" name="done">' +
                '<p>' + "Done" + '</p>' +
            '</div>'+ 
        '</div>');

        $("#addnewtodo").val("")
        $("#description").val("")
    }
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






