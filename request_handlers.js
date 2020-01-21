const fs=require("fs");
const path=require("path");
const url=require("url");
const formidable=require("formidable");
const mysql=require("mysql2");
const dateformat=require("dateformat");
const md5=require('md5');
const Cookies=require('cookies');

var mime_types = {
   ".html": "text/html",
   ".css": "text/css",
   ".js": "text/javascript",
   ".jpg": "image/jpeg",
   ".png": "image/png"
};

var pool = mysql.createPool({
   host: "localhost",
   user: "root",
   password: "",
   database: "goldsrc",
   waitForConnections: true,
   connectionLimit: 30
});

function generateCode() {
   return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function auth(req, answer) {
   var form = new formidable.IncomingForm();

   form.parse(req, function(err, fields, form_files) {
      if(err) {
         error_alert(answer, err);
         return;
      }

      pool.query("select id, password from users where email=?", [fields.email], (err, res, _) => {
         if(err || res.length == 0 || md5(fields.password) != res[0].password) {
            error_alert(answer, err);
            return;
         }

         var id=res[0].id;
         var hash=md5(generateCode());
         var date=new Date();
         date.setTime(date.getTime()+259200*1000);

         pool.query("update users set hash=?, endAuth=from_unixtime(?) where id=?", [hash, Math.round(date.getTime()/1000), id], (err, res, _) => {
            if(err) {
               error_alert(answer, err);
               return;
            }

            var cookies=new Cookies(req, answer);
            cookies.set('id', id, {maxAge: 259200*1000});
            cookies.set('hash', hash, {maxAge: 259200*1000});

            answer.writeHead(200);
            answer.end();
         });
      });
   });
}

function register(req, answer) {
   var form = new formidable.IncomingForm();

   form.parse(req, function(err, fields, form_files) {
      if(err || !(fields.email && fields.password && fields.nickname && fields.password == fields.confirm_password)) {
         error_alert(answer, err);
         return;
      }

      pool.query("select id from users where email=?", [fields.email], (err, res, _) => {
         if(err) {
            error_alert(answer, err);
            return;
         }
         if(res.length != 0) {
            error_alert(answer, "Адрес электронной почты занят!");
            return;
         }

         var hash=md5(generateCode());
         var date=new Date();
         date.setTime(date.getTime()+259200*1000);

         pool.query("insert into users (email, password, nickname, hash, endAuth) values (?, ?, ?, ?, from_unixtime(?))", [fields.email, md5(fields.password), fields.nickname, hash, Math.round(date.getTime()/1000)], (err, res, _) => {
            if(err) {
               error_alert(answer, err);
               return;
            }

            var cookies=new Cookies(req, answer);
            cookies.set('id', res.insertId, {maxAge: 259200*1000});
            cookies.set('hash', hash, {maxAge: 259200*1000});

            answer.writeHead(200);
            answer.end();
         });
      });
   });
}

function logout(req, answer) {
   var cookies=new Cookies(req, answer);
   if(!cookies.get('id'))
      return;

   pool.query("update users set hash=null, endAuth=null where id="+cookies.get('id'), (_, __, ___) => {});
   cookies.set('id', null);
   cookies.set('hash', null);
   answer.writeHead(200);
   answer.end();
}

function check_auth(req, answer) {
   var cookies=new Cookies(req, answer);
   var id=cookies.get('id');
   var hash=cookies.get('hash');
   if(!(id && hash)) {
      answer.writeHead(200);
      answer.end();
      return;
   }

   pool.query("select hash, nickname, avatar, timestampdiff(hour, now(), endAuth) from users where id=?", [id], (err, res, _) => {
      if(err || res.length == 0 || hash != res[0].hash) {
         error_alert(answer, err);
         return;
      }

      var nickname=res[0].nickname;
      var avatar=res[0].avatar;

      if(res[0]['timestampdiff(hour, now(), endAuth)'] < 18) {
         var date=new Date();
         date.setTime(date.getTime()+259200*1000);

         pool.query("update users set endAuth=from_unixtime(?) where id=?", [Math.round(date.getTime()/1000), id], (err, res, _) => {
            if(err) {
               error_alert(answer, err);
               return;
            }

            cookies.set('id', id, {maxAge: 259200*1000});
            cookies.set('hash', hash, {maxAge: 259200*1000});

            answer.writeHead(200);
            answer.write(JSON.stringify({'id': id, 'nickname': nickname, 'avatar': avatar}));
            answer.end();
         });
      } else {
         answer.writeHead(200);
         answer.write(JSON.stringify({'id': id, 'nickname': nickname, 'avatar': avatar}));
         answer.end();
      }
   });
}

function get_users_info(req, answer) {
   var form = new formidable.IncomingForm();

   form.parse(req, function(err, fields, form_files) {
      if(err || !fields.users_id) {
         error_alert(answer, err);
         return;
      }

      var users_id=JSON.parse(fields.users_id);
      pool.query("select id, nickname, avatar from users where id in ("+users_id.join(', ')+") group by id", (err, res, _) => {
         if(err) {
            error_alert(answer, err);
            return;
         }

         answer.writeHead(200);
         answer.write(JSON.stringify(res));
         answer.end();
      });
   });
}

function accept_settings(req, answer) {
   var form = new formidable.IncomingForm();
   var cookies=new Cookies(req, answer);

   form.parse(req, function(err, fields, form_files) {
      var changes=[];

      if(fields.isDeleteAvatar) {
         fs.unlink(path.join(__dirname, "data/avatars/"+cookies.get('id')+".jpg"), err => {});
         changes.push("avatar=0");
      } else if(form_files.avatar && form_files.avatar.name != '') {
         fs.copyFileSync(form_files.avatar.path, path.join(__dirname, "data/avatars/"+cookies.get('id')+".jpg"));
         changes.push("avatar=1");
      }

      if(fields.newNickname != '') {
         changes.push("nickname='"+fields.newNickname+"'");
      }

      if(changes.length == 0) {
         answer.writeHead(200);
         answer.end();
         return;
      }

      pool.query("update users set "+changes.join(', ')+" where id="+cookies.get('id'), (err, _, __) => {
         if(err) {
            error_alert(answer, err);
            return;
         }

         answer.writeHead(200);
         answer.end();
      });
   });
}

function loadResource(req, res) {
   var pathname=path.join(__dirname, url.parse(req.url).pathname);
   var ext=path.extname(pathname);

   fs.stat(pathname, (err, stats) => {
      if(err || !stats.isFile()) {
         res.writeHead(404, {"Content-Type": "text/plain"});
         res.write(err+'\n');
         res.end();
      } else {
         if(ext in mime_types) {
            fs.readFile(pathname, (err, data) => {
               if(err) {
                  res.writeHead(500, {"Content-Type": "text/plain"});
                  res.write(err+'\n');
                  res.end();
               } else {
                  res.writeHead(200, {"Content-Type": mime_types[ext]});
                  res.write(data);
                  res.end();
               }
            });
         } else {
            fs.readFile(pathname, "binary", (err, data) => {
               if(err) {
                  res.writeHead(500, {"Content-Type": "text/plain"});
                  res.write(err+'\n');
                  res.end();
               } else {
                  res.writeHead(200);
                  res.write(data);
                  res.end();
               }
            });
         }
      }
   });
}

function loadListArticles(req, answer) {
   var params=url.parse(req.url, true).query;
   var category_id=Number(params.category_id);
   var query="select * from articles";
   if(category_id)
      query += " where category="+category_id;
   query += " order by id desc";

   pool.query(query, (err, res, fields) => {
      if(err) {
         error_alert(answer, err);
         return;
      }

      var data=Array();

      res.forEach((row) => {
         data.push({
            'id': row.id,
            'account_id': row.idAccount,
            'category_id': row.category,
            'date': dateformat(row.date, 'dd.mm.yyyy HH:MM'),
            'name': row.name,
            'preview_url': row.preview ? '/data/articles/'+row.id+'/preview.jpg' : 'team_logo.jpg',
            'description': row.description ? String(fs.readFileSync(path.join(__dirname, '/data/articles/'+row.id+'/description.txt'))) : ''
         });
      });

      answer.writeHead(200);
      answer.write(JSON.stringify(data));
      answer.end();
   });
}

function loadListCategories(req, answer) {
   pool.query("select * from categoriesarticles", (err, res, fields) => {
      if(err) {
         error_alert(answer, err);
         return;
      }

      var data={};

      res.forEach((row) => {
         data[row.id]=row.name;
      });

      answer.writeHead(200);
      answer.write(JSON.stringify(data));
      answer.end();
   });
}

function loadArticle(req, answer) {
   var params=url.parse(req.url, true).query;
   var article_id=Number(params.id);
   if(!article_id) {
      error_alert(answer, "invalid id");
      return;
   }

   pool.query("select * from articles where id="+article_id, (err, res, _) => {
      if(err || res.length == 0) {
         error_alert(answer, err);
         return;
      }

      var data = {
         'id': res[0].id,
         'account_id': res[0].idAccount,
         'category_id': res[0].category,
         'date': dateformat(res[0].date, 'dd.mm.yyyy HH:MM'),
         'name': res[0].name,
         'preview_url': res[0].preview ? '/data/articles/'+res[0].id+'/preview.jpg' : 'team_logo.jpg',
         'description': res[0].description ? String(fs.readFileSync(path.join(__dirname, '/data/articles/'+res[0].id+'/description.txt'))) : '',
         'content': String(fs.readFileSync(path.join(__dirname, 'data/articles/'+article_id+'/'+res[0].contentsFile), 'utf8'))
      };

      answer.writeHead(200);
      answer.write(JSON.stringify(data));
      answer.end();
   });
}

function editArticle(req, answer) {
   var form = new formidable.IncomingForm();
   var cookies=new Cookies(req, answer);
   if(!cookies.get('id')) {
      answer.writeHead(200);
      answer.end();
      return;
   }

   form.parse(req, function(err, fields, form_files) {
      if(err) {
         error_alert(answer, err);
         return;
      }

      var fragments=Array();
      var i=1;
      while(fields['name'+i]) {
         fragments.push(fields['name'+i]);
         fragments.push(fields['description'+i]);
         ++i;
      }

      if(fields.article_id == 0) {
         var date=new Date();
         date.setTime(date.getTime()+259200*1000);

         pool.query("insert into articles (idAccount, category, date, name, preview, description, contentsFile) values (?, ?, from_unixtime(?), ?, ?, ?, ?)", [cookies.get('id'), fields.category, Math.round(date.getTime()/1000), fields.nameArticle, form_files.previewArticle.name != '', 1, "article.txt"], (err, res, _) => {
            if(err) {
               error_alert(answer, err);
               return;
            }

            fs.mkdirSync(path.join(__dirname, "data/articles/"+res.insertId));
            fs.writeFileSync(path.join(__dirname, "data/articles/"+res.insertId+"/description.txt"), fields.descriptionArticle);
            fs.writeFileSync(path.join(__dirname, "data/articles/"+res.insertId+"/article.txt"), JSON.stringify(fragments));
            if(form_files.previewArticle && form_files.previewArticle.name != '') {
               fs.copyFileSync(form_files.previewArticle.path, path.join(__dirname, "data/articles/"+res.insertId+"/preview.jpg"));
            }

            answer.writeHead(200);
            answer.end();
         });
      } else {
         pool.query("update articles set category=?, name=?, preview=? where id=?", [Number(fields.category), fields.nameArticle, !Number(fields.isDeletedPreview), Number(fields.article_id)], (err, res, _) => {
            if(err) {
               error_alert(answer, err);
               return;
            }

            fs.writeFileSync(path.join(__dirname, "data/articles/"+fields.article_id+"/description.txt"), fields.descriptionArticle);
            fs.writeFileSync(path.join(__dirname, "data/articles/"+fields.article_id+"/article.txt"), JSON.stringify(fragments));
            if(form_files.previewArticle && form_files.previewArticle.name != '') {
               fs.copyFileSync(form_files.previewArticle.path, path.join(__dirname, "data/articles/"+fields.article_id+"/preview.jpg"));
            }

            answer.writeHead(200);
            answer.end();
         });
      }
   });
}

const deleteFolderRecursive = function(arg_path) {
  if (fs.existsSync(arg_path)) {
    fs.readdirSync(arg_path).forEach((file, index) => {
      const curPath = path.join(arg_path, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(arg_path);
  }
};

function deleteArticle(req, answer) {
   var params=url.parse(req.url, true).query;
   var article_id=Number(params.id);
   if(!article_id) {
      error_alert(answer, "invalid id");
      return;
   }

   var cookies=new Cookies(req, answer);
   var account_id=cookies.get('id');
   var hash=cookies.get('hash');
   if(!(account_id && hash)) {
      error_alert(answer, "invalid account");
      return;
   }

   pool.query("select hash from users where id="+account_id, (err, res, _) => {
      if(err || res.length == 0) {
         error_alert(answer, err);
         return;
      }

      if(hash != res[0].hash) {
         error_alert(answer, "invalid hash");
         return;
      }

      pool.query("select idAccount from articles where id="+article_id, (err, res, _) => {
         if(err || res.length == 0) {
            error_alert(answer, err);
            return;
         }

         if(account_id != res[0].idAccount) {
            error_alert(answer, "invalid account");
            return;
         }

         pool.query("delete from articles where id="+article_id, (err, res, _) => {
            if(err || res.length == 0) {
               error_alert(answer, err);
               return;
            }

            deleteFolderRecursive(path.join(__dirname, "data/articles/"+article_id));

            answer.writeHead(200);
            answer.end();
         });
      });
   })
}

function loadListFiles(req, res) {
   res.writeHead(200, {"Content-Type": "text/plain"});
   res.write(JSON.stringify(files));  // передаём json-строку
   res.end();
}

function error_alert(res, err) {
   res.writeHead(500, {"Content-Type": "text/plain"});
   res.write(err+'\n');
   res.end();
}

function uploadFile(req, res) {
   var form = new formidable.IncomingForm();

   form.parse(req, function(err, fields, form_files) {
      var filepath=__dirname;

      if(("file" in form_files) && (form_files["file"].name != '')) {
         filepath=path.join(filepath, "files\\"+files.length);
         fs.mkdir(filepath, (err) => {
            if(err) {
               error_alert(res, err);
            } else {
               // создали новую директорию
               var filename=path.join(filepath, form_files["file"].name);
               fs.copyFileSync(form_files["file"].path, filename);

               // копируем превью-изображение
               if(("preview" in form_files) && (form_files["preview"].name != '')) {
                  fs.copyFileSync(form_files["preview"].path, path.join(filepath, "preview.jpg"));
               }

               // редактируем массив files
               var fileinfo={
                  "name": fields["filename"],
                  "size": (form_files["file"].size/1024/1024).toFixed(2) +" Mb",
                  "date": new Date().toLocaleString(),
                  "href": form_files["file"].name,
                  "desc": fields["description"]
               };
               console.log(fileinfo);
               files.push(fileinfo);
               fs.writeFileSync(path.join(__dirname, "list.json"), JSON.stringify(files));

               res.writeHead(200);
               res.end();
            }
         });
      } else {
         error_alert(res, 0);
      }
   });
}

exports.auth=auth;
exports.register=register;
exports.logout=logout;
exports.check_auth=check_auth;
exports.get_users_info=get_users_info;
exports.accept_settings=accept_settings;
exports.loadResource=loadResource;
exports.loadListArticles=loadListArticles;
exports.loadListCategories=loadListCategories;
exports.loadArticle=loadArticle;
exports.editArticle=editArticle;
exports.deleteArticle=deleteArticle;
exports.loadListFiles=loadListFiles;
//exports.showPreview=showPreview;
exports.uploadFile=uploadFile;
