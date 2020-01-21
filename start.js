const http=require("http");
const url=require("url");
const fs=require("fs");
const path=require("path");
const req_handlers=require(path.join(__dirname, "request_handlers.js"));

handlers={
	// "/load": req_handlers.loadListFiles,
	// "/preview": req_handlers.showPreview
	// "/upload": req_handlers.uploadFile
	"/auth": req_handlers.auth,
	"/register": req_handlers.register,
	"/logout": req_handlers.logout,
	"/check_auth": req_handlers.check_auth,
	"/get_users_info": req_handlers.get_users_info,
	"/accept_settings": req_handlers.accept_settings,
   "/load_list_articles": req_handlers.loadListArticles,
   "/load_list_categories": req_handlers.loadListCategories,
   "/load_article": req_handlers.loadArticle,
   "/edit_article": req_handlers.editArticle,
   "/delete_article": req_handlers.deleteArticle
};

function onRequest(req, res) {
	var pathname=url.parse(req.url).pathname;
	if(pathname in handlers) {
		handlers[pathname](req, res);
	} else {
		req_handlers.loadResource(req, res);
	}
}
http.createServer(onRequest).listen(8888);

console.log("Server has started.");
