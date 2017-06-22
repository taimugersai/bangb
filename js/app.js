/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
	/**
	 * 用户登录
	 **/
	var url='http://47.92.90.21/api';
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if(loginInfo.account.length < 11) {
			return callback('账号最短为 11个字符');
		}
		if(loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}

		/*var user = JSON.parse(localStorage.getItem('user') || '[]');
		var authed = user.some(function(user) {
			return loginInfo.account == user.account && loginInfo.password == user.password;
		});
		if (authed) {
			return owner.createState(loginInfo.account, callback);
		} else {
			return callback('用户名或密码错误');
		}*/
		$.ajax({
			type: "post",
			url: loginInfo.type == 0 ? url+"/auth/vendor/login" : url+"/auth/clerk/login",
			async: true,
			data: {
				mobile: loginInfo.account,
				password: loginInfo.password,
			},
			dataType: 'json',
			success: function(response) {
				if(!response.data) {
					return callback(response.message);
				}
				localStorage.setItem('token', response.data.token);
				localStorage.setItem('id', response.data.id);
				localStorage.setItem('account', response.data.account);
				return callback();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				return callback(JSON.parse(XMLHttpRequest.response).message);
			}
		});
	};
	owner.getUser = function(type, token, id, success, error) {
		$.ajax({
			type: "get",
			url: type == 0 ? url+"/vendor" : url+"/clerk",
			async: true,
			dataType: 'json',
			beforeSend: function(request) {
				request.setRequestHeader("Authorization", 'bearer' + token);
			},
			success: function(response) {
				if(!response.data) {
					return error(response.message);
				}
				localStorage.setItem('user', JSON.stringify(response.data));
				return success();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				return error(errorThrown);
			}
		});
	};
	owner.clearUser = function() {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		localStorage.removeItem('id');
		localStorage.removeItem('account');
	}
	owner.reset = function(password, new_password, success, error) {
		var type = localStorage.getItem('type');
		var token = localStorage.getItem('token');
		$.ajax({
			type: "post",
			url: type == 0 ? url+"/vendor/reset" : url+"/clerk/reset",
			data: {
				password: password,
				new_password: new_password
			},
			async: true,
			dataType: 'json',
			beforeSend: function(request) {
				request.setRequestHeader("Authorization", 'bearer' + token);
			},
			success: function(response) {
				if(response.status_code != 200) {
					return error();
				}
				return success();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				return error(JSON.parse(XMLHttpRequest.response).message);
			}
		});
	};
	owner.forget = function(mobile, verify_code, password, success, error) {
		var type = localStorage.getItem('type');
		var token = localStorage.getItem('token');
		$.ajax({
			type: "post",
			url: type == 0 ? url+"/auth/vendor/forget-password" : url+"/auth/clerk/forget-password",
			data: {
				mobile: mobile,
				verify_code: verify_code,
				password: password
			},
			async: true,
			dataType: 'json',
			success: function(response) {
				if(!response.data) {
					return error();
				}
				localStorage.setItem('token', response.data.token);
				localStorage.setItem('id', response.data.id);
				localStorage.setItem('account', response.data.account);
				return success();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				return error(JSON.parse(XMLHttpRequest.response).message);
			}
		});
	};
	owner.createState = function(name, callback) {
		var state = owner.getState();
		state.account = name;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		if(regInfo.account.length < 11) {
			return callback('手机号最短需要 11个字符');
		}
		if(regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		$.ajax({
			type: "post",
			url: regInfo.type == 0 ? url+"/auth/vendor/register" : url+"/auth/clerk/register",
			async: true,
			data: {
				mobile: regInfo.account,
				password: regInfo.password,
				verify_code: regInfo.verify_code,
                recommend_user:regInfo.recommend_user
			},
			dataType: 'json',
			success: function(response) {
				if(!response.data) {
					return callback(response.message);
				}
				localStorage.setItem('token', response.data.token);
				localStorage.setItem('id', response.data.id);
				localStorage.setItem('account', response.data.account);
				return callback();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				return callback(JSON.parse(XMLHttpRequest.response).message);
			}
		});

	};
	owner.updateClerk = function(user, callback) {
		callback = callback || $.noop;
		var token = localStorage.getItem('token');
		$.ajax({
			type: "put",
			url: url+"/clerk",
			async: true,
			beforeSend: function(request) {
				request.setRequestHeader("Authorization", 'bearer' + token);
			},
			data: user,
			dataType: 'json',
			success: function(response) {
				if(!response.data) {
					return callback(response.message);
				}
				localStorage.setItem('user', JSON.stringify(response.data));
				return callback();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				return callback(JSON.parse(XMLHttpRequest.response).message);
			}
		});
	};
	owner.job_waiting=function(user){
        var token = localStorage.getItem('token');
        $.ajax({
            type: "post",
            url: url+"/clerk/status",
            async: true,
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", 'bearer' + token);
            },
            data: user,
            dataType: 'json',
            success: function(response) {
                if(!response.data) {
                    return callback(response.message);
                }
                localStorage.setItem('user', JSON.stringify(response.data));
            }
        });
	};
	owner.updateVendor = function(user, callback) {
		callback = callback || $.noop;
		user.name = user.name || '';
		user.comporation = user.comporation || '';
		user.mobile = user.mobile || '';
		user.address = user.address || '';
		user.introduce = user.introduce || '';
		if(user.name.length == 0) {
			return callback('公司名不能为空')
		}
		if(user.comporation.length == 0) {
			return callback('联系人不能为空')
		}
		if(user.address.length == 0) {
			return callback('地址不能为空')
		}
		var token = localStorage.getItem('token');
		$.ajax({
			type: "put",
			url: url+"/vendor",
			async: true,
			beforeSend: function(request) {
				request.setRequestHeader("Authorization", 'bearer' + token);
			},
			data: user,
			dataType: 'json',
			success: function(response) {
				if(!response.data) {
					return callback(response.message);
				}
				localStorage.setItem('user', JSON.stringify(response.data));
				return callback();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				return callback(JSON.parse(XMLHttpRequest.response).message);
			}
		});
	};
	owner.createTask = function(task, callback) {
		callback = callback || $.noop;
		var token = localStorage.getItem('token');
		$.ajax({
			type: "post",
			url: url+"/task",
			async: true,
			beforeSend: function(request) {
				request.setRequestHeader("Authorization", 'bearer' + token);
			},
			data: task,
			dataType: 'json',
			success: function(response) {
				if(!response.data) {
					return callback(response.message);
				}
				return callback();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				return callback(JSON.parse(XMLHttpRequest.response).message);
			}
		});
	};
	owner.getTaskById=function(id,success,error){
        var token = localStorage.getItem('token');
        $.ajax({
            type: "get",
            url: url+"/task/"+id,
            async: true,
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", 'bearer' + token);
            },
            dataType: 'json',
            success: function(response) {
                if(!response.data) {
                    return error();
                }
                success(response.data);
            },
            error: function(xhr, type, errorThrown) {
                error(errorThrown);
            }
        });
	};
	owner.getTasks = function(success, error) {
		var token = localStorage.getItem('token');
		$.ajax({
			type: "get",
			url: url+"/task/",
			async: true,
			beforeSend: function(request) {
				request.setRequestHeader("Authorization", 'bearer' + token);
			},
			data: {
				page: 1,
				per_page: 15
			},
			dataType: 'json',
			success: function(response) {
				if(!response.data) {
					return error();
				}
				success(response.data);
			},
			error: function(xhr, type, errorThrown) {
				error(errorThrown);
			}
		});
	};
	owner.getOrderTasks = function(type, page, success, error) {
		var token = localStorage.getItem('token');
		$.ajax({
			type: "post",
			url: url+"/task/order",
			async: true,
			beforeSend: function(request) {
				request.setRequestHeader("Authorization", 'bearer' + token);
			},
			data: {
				page: page,
				per_page: 15,
				order: type,
				order_type: 'desc'
			},
			dataType: 'json',
			success: function(response) {
				if(!response.data) {
					return error();
				}
				success(response.data);
			},
			error: function(xhr, type, errorThrown) {
				error(errorThrown);
			}
		});
	};
	owner.getFilterTasks = function(status, page, success, error) {
		var token = localStorage.getItem('token');
		$.ajax({
			type: "post",
			url: url+"/task/filter/status",
			async: true,
			beforeSend: function(request) {
				request.setRequestHeader("Authorization", 'bearer' + token);
			},
			data: {
				page: page,
				per_page: 15,
				status: status
			},
			dataType: 'json',
			success: function(response) {
				if(!response.data) {
					return error();
				}
				success(response.data);
			},
			error: function(xhr, type, errorThrown) {
				error(errorThrown);
			}
		});
	};
	owner.getTagTasks = function(tag, page, success, error) {
		var token = localStorage.getItem('token');
		$.ajax({
			type: "post",
			url: url+"/task/filter",
			async: true,
			beforeSend: function(request) {
				request.setRequestHeader("Authorization", 'bearer' + token);
			},
			data: {
				page: page,
				per_page: 15,
				tag: tag
			},
			dataType: 'json',
			success: function(response) {
				if(!response.data) {
					return error();
				}
				success(response.data);
			},
			error: function(xhr, type, errorThrown) {
				error(errorThrown);
			}
		});
	};
	owner.getSearchTasks=function(tag, page, success, error) {
        var token = localStorage.getItem('token');
        $.ajax({
            type: "post",
            url: url+"/task/search",
            async: true,
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", 'bearer' + token);
            },
            data: {
                page: page,
                per_page: 15,
                tag: tag
            },
            dataType: 'json',
            success: function(response) {
                if(!response.data) {
                    return error();
                }
                success(response.data);
            },
            error: function(xhr, type, errorThrown) {
                error(errorThrown);
            }
        });
    };
	owner.signTask = function(id, success, error) {
		var token = localStorage.getItem('token');
		$.ajax({
			type: "get",
			url: url+"/task/sign/" + id,
			async: true,
			beforeSend: function(request) {
				request.setRequestHeader("Authorization", 'bearer' + token);
			},
			dataType: 'json',
			success: function(response) {
				if(!response.data) {
					return error();
				}
				success(response.data);
			},
			error: error
		});
	};
	owner.getNotify = function(page, success, error) {
		var token = localStorage.getItem('token');
		$.ajax({
			type: "get",
			url: url+"/notify",
			async: true,
			beforeSend: function(request) {
				request.setRequestHeader("Authorization", 'bearer' + token);
			},
			dataType: 'json',
			data: {
				page: page,
				per_page: 15
			},
			success: function(response) {
				if(!response.data) {
					return error();
				}
				success(response.data);
			},
			error: function(xhr, type, errorThrown) {

			}
		});
	};
	owner.readNotify=function(notification,success){
        var token = localStorage.getItem('token');
        $.ajax({
            type: "get",
            url: url+"/notify/"+notification.id,
            async: true,
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", 'bearer' + token);
            },
            dataType: 'json',
            success: function(response) {
               notification.have_read=true;
                success();
            },
            error: function(xhr, type, errorThrown) {

            }
        });
	};
	owner.getNotifyList = function(notifications,count) {
		var html = '';
		var unread=count;
		notifications.forEach(function(value, index, array) {
			html += '<li class="mui-table-view-cell" data-guid=\"' + value.id + '\">' +
				'<div class="mui-table">' +
				'<div class="mui-table-cell mui-col-xs-10">' +
				'<h4 class="mui-ellipsis">' + value.title + '</h4>' +
				'<h5>' + value.sender + '</h5>' +
				'<p class="mui-h6 mui-ellipsis">' + value.content + '</p>' +
				'</div>' +
				'<div class="mui-table-cell mui-col-xs-2 mui-text-right">' +
				'<span class="mui-h5">' + value.date + '</span>' +
				'<h5 id="read">' + (value.have_read?'已读':'未读') + '</h5>' +
				'</div>' +
				'</div>' +
				'</li>';
				if(value.have_read==false)unread+=1;			
		});
		localStorage.setItem('unread',unread);
		return html;
	};
    owner.getNotifyList2 = function(notifications,notification,count) {
        var html = '';
        notifications.forEach(function(value, index, array) {
        	if(value.id==notification.id)
        		value=notification;
            html += '<li class="mui-table-view-cell" data-guid=\"' + value.id + '\">' +
                '<div class="mui-table">' +
                '<div class="mui-table-cell mui-col-xs-10">' +
                '<h4 class="mui-ellipsis">' + value.title + '</h4>' +
                '<h5>' + value.sender + '</h5>' +
                '<p class="mui-h6 mui-ellipsis">' + value.content + '</p>' +
                '</div>' +
                '<div class="mui-table-cell mui-col-xs-2 mui-text-right">' +
                '<span class="mui-h5">' + value.date + '</span>' +
                '<h5 id="read">' + (value.have_read?'已读':'未读') + '</h5>' +
                '</div>' +
                '</div>' +
                '</li>';
        });
        return html;
    };
	owner.getTags = function(page,success, error) {
		$.ajax({
			type: "get",
			url: url+"/tag",
			async: true,
			dataType: 'json',
			data: {
				page: page,
				per_page: 40
			},
			success: function(response) {
				if(!response.data) {
					return error();
				}
				success(response.data);
			},
			error: function(xhr, type, errorThrown) {

			}
		});
	};
	owner.getSms = function(mobile, success, error) {
		$.ajax({
			type: "post",
			url: url+"/sms/code",
			async: true,
			dataType: 'json',
			data: {
				mobile: mobile,
			},
			success: function(response) {
				if(response.message != 'success') {
					return error('获取失败');
				}
				success();
			},
			error: function(xhr, type, errorThrown) {
				return error(JSON.parse(xhr.response).message);
			}
		});
	};
	owner.getImages=function (success) {
        $.ajax({
            type: "get",
            url: url+"/images",
            async: true,
            dataType: 'json',
            success: function(response) {
                if(!response.data) {
                    return ;
                }
                success(response.data);
            }
        });
    };
	owner.getTask = function(id, tasks) {
		var task;
		tasks.forEach(function(value, index, array) {
			if(value.id == id) {
				task = value;
				return;
			}
		});
		return task;
	};

	owner.getNotification = function(id, notifications) {
		var notification;
		notifications.forEach(function(value, index, array) {
			if(value.id == id) {
				notification = value;
				return;
			}
		});
		return notification;
	};
	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return(email.length > 3 && email.indexOf('@') > -1);
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if(!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	};

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	};
	/**
	 * 获取本地是否安装客户端
	 **/
	owner.isInstalled = function(id) {
		if(id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if(mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager);
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			};
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch(e) {}
		} else {
			switch(id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	};
    owner.AddDays=function(date,days){
        var nd = new Date(date);
        nd = nd.valueOf();
        nd = nd + days * 24 * 60 * 60 * 1000;
        nd = new Date(nd);
        //alert(nd.getFullYear() + "年" + (nd.getMonth() + 1) + "月" + nd.getDate() + "日");
        var y = nd.getFullYear();
        var m = nd.getMonth()+1;
        var d = nd.getDate();
        if(m <= 9) m = "0"+m;
        if(d <= 9) d = "0"+d;
        var cdate = y+"-"+m+"-"+d;
        return cdate;
    }
}(mui, window.app = {}));