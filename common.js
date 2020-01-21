var bgpopup=document.createElement('div');
bgpopup.className="bgpopup";
$(bgpopup).click(disablePopup);
var popup=document.createElement('div');
popup.className='popupWindow_wrapper';
var current_user=null, is_auth=false;

String.prototype.replaceAll = function(search, replace){
	return this.split(search).join(replace);
}

function enablePopupAuth() {
	popup.innerHTML='<div class="popupWindow popupAuth"> <h2>Вход в учетную запись</h2> <form method="post"> <div class="form_group"> <div class="form_item"> <label>E-mail</label> <input type="email" name="email" placeholder="Электронная почта"> </div> <div class="form_item"> <label>Пароль</label> <input type="password" name="password" placeholder="Пароль"> <p><a href="">Забыли пароль?</a></p> </div> </div> <input type="submit" value="Войти"> </form> </div>';
	$('form', popup).submit(function() {
		event.preventDefault();
		var inputs=this.querySelectorAll('input');
		$.ajax({
			url: 'auth',
			type: 'POST',
			data: ({'email' : inputs[0].value, 'password' : inputs[1].value}),
			error: function(err) {
				alert("Авторизация не удалась. "+err);
			},
			success: function() {
				location.reload();
			}
		});
	});

	document.body.appendChild(bgpopup);
	document.body.appendChild(popup);
}

function enablePopupRegister() {
	popup.innerHTML='<div class="popupWindow popupAuth"> <h2>Новая учетная запись</h2> <form method="post"> <div class="form_group"> <div class="form_item"> <label>E-mail</label> <input type="email" name="email" placeholder="Электронная почта"> </div> <div class="form_item"> <label>Пароль</label> <input type="password" name="password" placeholder="Пароль"> </div> <div class="form_item"> <label>Повторите пароль</label> <input type="password" name="oneMorePassword" placeholder="Ещё раз пароль"> </div> <div class="form_item"> <label>Nickname</label> <input type="text" name="nickname" placeholder="Nickname"> </div> </div> <input type="submit" value="Зарегистрироваться"> </form> </div>';
	$('form', popup).submit(function() {
		event.preventDefault();
		var inputs=this.querySelectorAll('input');
		$.ajax({
			url: 'register',
			type: 'POST',
			data: ({'email' : inputs[0].value, 'password' : inputs[1].value, 'confirm_password' : inputs[2].value, 'nickname' : inputs[3].value}),
			error: function(err) {
				alert("Регистрация не удалась. "+err);
			},
			success: function() {
				alert("Регистрация прошла успешно.");
				location.reload();
			}
		});
	});

	document.body.appendChild(bgpopup);
	document.body.appendChild(popup);
}

function enablePopupUserSettings() {
	popup.innerHTML='<div class="popupWindow popupUserSettings"> <h2>Настройки аккаунта</h2> <form method="post" enctype="multipart/form-data"> <div class="user_description"> <span>'+current_user.nickname+'</span> <img src="'+ (current_user.avatar ? 'data/avatars/'+current_user.id+'.jpg' : 'team_logo.jpg') +'"/> <button onclick="this.parentNode.children[3].click(); return false;">Сменить аватар</button> <input style="display: none;" type="file" name="avatar" onchange="this.parentNode.children[2].innerText=this.files[0].name"/> <div class="cb"> <input type="checkbox" name="isDeleteAvatar"/> <label>Удалить аватар</label> </div> </div> <div class="user_settings"> <div class="form_group"> <h3>Сменить nickname</h3> <div class="form_item"> <input type="text" name="newNickname" placeholder="Новый nickname"/> </div> </div> <div class="form_group"> <h3>Сменить E-mail</h3> <div class="form_item"> <label>Текущая электронная почта</label> <input type="email" name="currentEmail" placeholder="Текущий адрес"> </div> <div class="form_item"> <label>Новая электронная почта</label> <input type="email" name="newEmail" placeholder="Новый адрес"> </div> <div class="form_item"> <label>Пароль</label> <input type="password" name="password" placeholder="Пароль"> </div> </div> <div class="form_group"> <h3>Сменить пароль</h3> <div class="form_item"> <label>Текущий пароль</label> <input type="password" name="currentPassword" placeholder="Текущий пароль"> </div> <div class="form_item"> <label>Новый пароль</label> <input type="password" name="newPassword" placeholder="Новый пароль"> </div> <div class="form_item"> <label>Повторите новый пароль</label> <input type="password" name="oneMoreNewPassword" placeholder="Ещё раз новый пароль"> </div> </div> </div> <input type="submit" value="Сохранить изменения"/> </form> </div>';
	$('form', popup).submit(function() {
		event.preventDefault();
		var formData=new FormData(this);
		$.ajax({
			url: 'accept_settings',
			type: 'POST',
			cache: false,
			data: formData,
			dataType: 'html',
			processData: false,
			contentType: false,
			success: function() {
				location.reload();
			}
		});
		delete formData;
	});
	document.body.appendChild(bgpopup);
	document.body.appendChild(popup);
}

function disablePopup() {
	bgpopup.remove();
	popup.remove();
}

function checkAuth() {
	var result=false;
	$.ajax({
		url: 'check_auth',
		async: false,
		dataType: 'json',
		success: function(data) {
			if(data) {
				current_user=data;
				result=true;
			}
		}
	});
	return result;
}

function getUsersInfo(users_id) {
	$.ajax({
		url: 'get_users_info',
		async: false,
		method: 'POST',
		data: ({'users_id': JSON.stringify(users_id)}),
		dataType: 'json',
		success: function(data) {
			return data;
		}
	});
}

function logoutFromAccount() {
	$.ajax({
		url: 'logout',
		success: function() {
			location.reload();
		}
	});
}

$(document).ready(function() {
	var node_profile=$('.profile')[0];
	node_profile.className="profile";

	is_auth=checkAuth();
	if(is_auth) {
		node_profile.innerHTML='<img src="'+ (current_user.avatar ? 'data/avatars/'+current_user.id+'.jpg' : 'team_logo.jpg') +'"/> <div class="action_bar"> <a href="">'+current_user.nickname+'</a> <span onclick="enablePopupUserSettings()">Настройки</span> <span onclick="logoutFromAccount()">Выйти</span> </div>';
	} else {
		node_profile.innerHTML='<div class="buttonAction">Войти</div> <div class="buttonAction">Регистрация</div>';
		$(node_profile.children[0]).click(enablePopupAuth);
		$(node_profile.children[1]).click(enablePopupRegister);
	}
});