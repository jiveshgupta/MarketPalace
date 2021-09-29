console.log('heii');
var socket = io();
console.log(socket);
$('.interested').click((event) => {
    event.preventDefault();
    var flag = confirm('send message to product owner that u r interested in the product ? ');
    if (flag) {

        console.log('send');

        
        var userId = $('#user-id').text();
        var userEmail = $('#user-email').html();
        socket.emit('connectUser', { userEmail, userId });
        var time = Date.now();
        socket.emit('send', { to: $('.authorEmail').text(), from: userEmail, msg: `hello friend, I am ${userEmail} intersted in your product with name ${'.productName'} , price ${'.productPrice'}`, info: 'fromProduct' , time : time});
    }
});

socket.on('sent', () => {
    // $('.msg-input').text()='heloo from server';
    console.log('msg sent');
    alert('msg sent');
});

