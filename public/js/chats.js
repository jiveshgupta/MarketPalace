console.log("hello");
var socket=io();
console.log(socket);

var userId = $('#user-id').text();
var userEmail = $('#user-email').html();
socket.emit('connectUser', {  userEmail, userId });

$('.send').click((event)=> {
    event.preventDefault();
    console.log('val',$('.msg-input').val());
    var time = Date.now();
    console.log(time);
    var new_msg = document.createElement("div");
    new_msg.classList.add('msg');
    new_msg.classList.add('right');
    new_msg.textContent =$('.msg-input').val();
    $('.chats').append(new_msg);


    console.log('send to ',$('.receiverEmail').val(),'*************',$('.receiverEmail').text());
    socket.emit('send', { to: $('.receiverEmail').text() , from : userEmail , msg : $('.msg-input').val() , time:  time});
    
    
    $('.msg-input').val('');
    
    var receiverId = $('.receiverId').text();
    var receiverChat = $(`#${receiverId}`);
    receiverChat.insertBefore($('.contactLink').first());
    console.log(receiverId,$(`#${receiverId}`));
});


function zzz(event){
    console.log('zzzz clicked',event);
    event.preventDefault();
    console.log('clicbnked');
    console.log($('.contactLink'),'*****',$('.contactLink').length);
    // $('.receiverEmail').val($(this).attr("id"));
    $('.initChatPic').css('display','none');
    // console.log(this);
    var ele=event.target.closest('.contactLink');
    // console.log(event.target.closest('.contactLink'));
    // console.log(event.target.closest('.contactLink').id);
    // console.log(ele,typeof(ele),Object.keys(ele));
    var iid = `#${event.target.closest('.contactLink').id}`;
    var elu=$(iid);

    $('.msg').remove();
    var all = $('.contact');
    all.removeClass('activeChat');
    elu.children('div.contact').addClass('activeChat');;


    // console.log(elu,typeof(elu),Object.keys(elu));
    var iidd=elu.attr('id').toString();
    // console.log("iidd************",iidd);
    $.post(`/chatsData`,{uId: userId, rId: iidd},async(data,status)=>{
        // console.log('data',data);
        // console.log('status',status);
        // console.log(typeof(data.chat),data.chat.length,data.chat[0]);
        for(var key in data.chat){
            

            var new_msg = document.createElement("div");
            new_msg.classList.add('msg');
            if(data.chat[key].sender === userEmail)
                new_msg.classList.add('right');
            else
                new_msg.classList.add('left');
            // console.log(data.chat[key]);
        
            new_msg.textContent =data.chat[key].msg + '*******'+ data.time + '*******' + data.chat[key].time;
            $('.chats').append(new_msg);
            // console.log('gooood',new_msg,data.chat[key].msg);
        }



    })

    $('.receiverEmail').text(elu.attr('data_mail'));
    $('.receiverId').text(elu.attr('id'));
    $('.receiverName').text( elu.children('div.contact').children('div.details').children('.chatName').text() );
    // console.log(elu.children('div.contact').children('div.details').children('div.contact'));
    // console.log('amail and id', (elu.attr('data_mail')),'****',
    //  elu.val('id'),'***',
    // $('.receiverEmail').text(),
    // "****",
    // $('.receiverId').text());

}

socket.on('receive', (data) => {
    console.log('recieving', data);
    console.log('receiver details:' ,$('.receiverId').text() ,$('.receiverEmail').text());
    
    console.log(($('.receiverId').text() === data.sender._id) , ($('.receiverEmail').text() === data.sender.email));
    var all = $('.contactLink');
    
    // $(`#${data.fromId}`).insertBefore($('.contactLink').first());

    // $('.msg-input').val('heloo from serverrrrrrrr');
    if(data.newChat === true){
        
        // <a href="" class="contactLink" id= <%= chat.receiverId._id %> data_mail =<%= chat.receiverId.email %>>
        //             <div class="contact">
        //                 <img alt="img" class="contactDp" src=<%= chat.receiverId.displayPic == "" ? "/images/nightsky.jpg" : "/user_images/" + chat.receiverId._id + "/displayPic/" + chat.receiverId.displayPic %>>
        //                 <div class="details">
        //                     <h2 class="chatName"><%= chat.receiverId.name %></h2>
        //                     <span class="chatEmail" style="display: none;"><%= chat.receiverId.email %></span>
        //                     <span class="chatId" style="display: none;"><%= chat.receiverId._id %></span>
        //                     <p>msg</p>
        //                 </div>
        //             </div>
        //         </a>

        
        // var newContactLink = document.createElement('a');
        // newContactLink.classList.add('contactLink');
        // newContactLink.id = data.fromId;
        // newContactLink.href= "javascript:void(0)";
        // newContactLink.setAttribute('data_mail',data.from);


        var newContactLink = document.createElement('button');
        newContactLink.classList.add('contactLink');
        newContactLink.id = data.fromId;
        // newContactLink.onclick = zzz;
        // newContactLink.setAttribute('onclick','zzz(event)');
        newContactLink.setAttribute('data_mail',data.from);
        
        var newContact = document.createElement('div');
        newContact.classList.add('contact');
        
        var newContactDp = document.createElement('img');
        newContactDp.classList.add('contactDp');
        
        newContactDp.src = data.sender.displayPic == "" ? "/images/nightsky.jpg" : "/user_images/" + data.sender._id + "/displayPic/" + data.sender.displayPic;
        
        var newDetails = document.createElement('div');
        newDetails.classList.add('details');
        newDetails.id = data.fromId;

        var newChatName = document.createElement('h2');
        newChatName.classList.add('chatName');
        newChatName.textContent = data.sender.name;
        
        
        var newChatEmail = document.createElement('span');
        newChatEmail.classList.add('chatEmail');
        newChatEmail.style.display= 'none';
        newChatEmail.textContent = data.sender.email;
        
        var newChatId = document.createElement('span');
        newChatId.classList.add('chatId');
        
        newChatId.style.display= 'none';
        newChatId.textContent = data.sender._id;

        var newP = document.createElement('p');
        newP.textContent = 'msg';

        newDetails.append(newChatName);
        newDetails.append(newChatEmail);
        newDetails.append(newChatId);
        newDetails.append(newP);

        newContact.append(newContactDp);
        newContact.append(newDetails);
        
        newContactLink.append(newContact);

        
        // newContactLink.appendTo(".contactList");
        $('.contactList').append(newContactLink);
        console.log('newContactLink',newContactLink);





        // var newChat=$(".contactLink").clone();
        // newChat.appendTo(".contactList");
        // console.log('newChat',newChat);
    }
    else if(($('.receiverId').text() === data.sender._id) && ($('.receiverEmail').text() === data.sender.email)){
    var new_msg = document.createElement("div");
    new_msg.classList.add('msg');
    new_msg.classList.add('left');
    new_msg.textContent =data.msg;
    $('.chats').append(new_msg);
    }
    
    $(`#${data.fromId}`).insertBefore($('.contactLink').first());
    console.log('gooood',new_msg,data.msg);
});

socket.on('good', () => {
    // $('.msg-input').text()='heloo from server';
    console.log('gooood');
});

socket.on('back', () => {
    $('.msg-input').text='heloo from server';
    console.log('bakcing from server');
});

// $('.contactLink').click((event)=> {
//     event.preventDefault();
//     console.log('clicbnked');
// });

// var chatLinks = $('.contactLink');
// for(var key=0; key< chatLinks.length ; key++){
//     console.log(key,chatLinks[key]);
//     console.log(chatLinks[key].id);
//     var iid=`#${chatLinks[key].id}`;
//     $(iid).click((event)=>{
//         console.log("helloooo clicked",$(iid).attr('data-mail'));
//         // $(iid )
//     });
// }

$('.contactList').on('click','.contactLink',(event)=>{
    
    event.preventDefault();
    console.log('clicbnked');
    console.log($('.contactLink'),'*****',$('.contactLink').length);
    // $('.receiverEmail').val($(this).attr("id"));
    $('.initChatPic').css('display','none');
    // console.log(this);
    var ele=event.target.closest('.contactLink');
    // console.log(event.target.closest('.contactLink'));
    // console.log(event.target.closest('.contactLink').id);
    // console.log(ele,typeof(ele),Object.keys(ele));
    var iid = `#${event.target.closest('.contactLink').id}`;
    var elu=$(iid);

    $('.msg').remove();
    var all = $('.contact');
    all.removeClass('activeChat');
    elu.children('div.contact').addClass('activeChat');;


    // console.log(elu,typeof(elu),Object.keys(elu));
    var iidd=elu.attr('id').toString();
    // console.log("iidd************",iidd);
    $.post(`/chatsData`,{uId: userId, rId: iidd},async(data,status)=>{
        // console.log('data',data);
        // console.log('status',status);
        // console.log(typeof(data.chat),data.chat.length,data.chat[0]);
        for(var key in data.chat){
            

            var new_msg = document.createElement("div");
            new_msg.classList.add('msg');
            if(data.chat[key].sender === userEmail)
                new_msg.classList.add('right');
            else
                new_msg.classList.add('left');
            // console.log(data.chat[key]);
        
            new_msg.textContent =data.chat[key].msg + '*******'+ data.time + '*******' + data.chat[key].time;
            $('.chats').append(new_msg);
            // console.log('gooood',new_msg,data.chat[key].msg);
        }



    })

    $('.receiverEmail').text(elu.attr('data_mail'));
    $('.receiverId').text(elu.attr('id'));
    $('.receiverName').text( elu.children('div.contact').children('div.details').children('.chatName').text() );
    // console.log(elu.children('div.contact').children('div.details').children('div.contact'));
    // console.log('amail and id', (elu.attr('data_mail')),'****',
    //  elu.val('id'),'***',
    // $('.receiverEmail').text(),
    // "****",
    // $('.receiverId').text());
})


// $('.currentChat').click((event)=> {
//     // event.preventDefault();
//     console.log('cliced');
// });

// $('.currentChat').click((event)=>{
//     // $('.receiverEmail').val($(this).attr("id"));
//     // $('.receiverEmail').val($('.chatEmail').val());
//     // $('.receiverId').val($('.chatId').val());
//     console.log(this);
    
//     // console.log($('.chatEmail').val());
//     console.log($(this).attr("id"));
// })