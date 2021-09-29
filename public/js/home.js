console.log('heii');
var socket = io();
console.log(socket);
console.log(socket);
$('.interested').click((event) => {
    event.preventDefault();
    console.log('button');

    var iid = $(event.target.closest('.others'));
    // var elu=$(iid);
    
    // console.log('target',event.target.closest('.others'));
    console.log('target',iid);
    console.log('target',iid.siblings());
    console.log('target',iid.siblings().children('.author').children('.author-info').children('.author-contact').text());
    var author_contact=iid.siblings().children('.author').children('.author-info').children('.author-contact').text().trim().split(',');
    var receiverEmail = author_contact[0].trim();
    console.log(receiverEmail); 
    
    var flag = confirm('send message to product owner that u r interested in the product ? ');
    if (flag) {

        console.log('send');
        var userId = $('#user-id').html();
        var userEmail = $('#user-email').html();
        
        // var receiverEmail = elu.children('.content').children('author').children('author-name').text();
        
        socket.emit('connectUser', { userEmail, userId });
        var time = Date.now();
        console.log(userId, userEmail, receiverEmail);
        socket.emit('send', { to: receiverEmail, from: userEmail, msg: `hello friend, I am ${userEmail} intersted in your product with name ${'.productName'} , price ${'.productPrice'}`, info: 'fromProduct' , time : time});
    }
});

socket.on('sent', () => {
    // $('.msg-input').text()='heloo from server';
    console.log('msg sent');
    alert('msg sent');
});

