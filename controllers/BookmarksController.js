const Repository = require('../models/Repository');
const url = require('url');
const utilities = require('../utilities');

module.exports =
class BookmarksController extends require('./Controller') {
  constructor(req, res){
    super(req, res);
    this.bookmarksRepository = new Repository('Bookmarks');
  }
  // GET: api/contacts
  // GET: api/contacts/{id}
  get(id){
    const reqUrl =  url.parse(this.req.url, true);
    const availableOperations = [
      {
        "Retourne le signet portant ce nom (GET)": "/api/bookmarks?name=nom",
        "Retourne le signet avec cet id (GET)": "/api/bookmarks/id",
        "Ajoute un signet (POST)": "/api/bookmarks",
        "Modifie le signet avec cet id (PUT)": "/api/bookmarks/id",
        "Enlève le signet avec cet id (DELETE)": "/api/bookmarks/id",
      }
    ]
    let bookmarks = [];

    if(reqUrl.search === "?"){
      this.response.JSON(availableOperations);
      return;
    }

    if(!isNaN(id)){
      this.response.JSON(this.bookmarksRepository.get(id));
      return;
    }
    else
      bookmarks = this.bookmarksRepository.getAll();

    let foundParam = 0;
    let nbParam = Object.keys(reqUrl.query).length;

    if(reqUrl.query.name){
      bookmarks = this.searchByName(reqUrl.query.name, bookmarks);
      foundParam++;
    }

    if(reqUrl.query.category){
      bookmarks = this.searchByCategory(reqUrl.query.category, bookmarks);
      foundParam++;
    }

    if(reqUrl.query.sort){
      bookmarks = this.sort(reqUrl.query.sort, bookmarks);
      foundParam++;
    }

    // S'il y avait des paramètres et qu'ils n'ont pas tous été traité (foundParam est incrémenté à chaque traitement),
    // on avertit le client qu'un de ses paramètres n'a pas pu être traité.
    if(reqUrl.search != null && foundParam != nbParam){
      const jsonObj = utilities.createJsonErrorBody(
        "Le clé d'un ou plusieurs paramètres n'existe pas.",
        422
      )
      this.response.JSONError(jsonObj,422);
      return;
    }

    // On vérifie qu'une réponse n'a pas déjà été retourné par un service si celui-ci à rencontré une erreur.
    try{
      this.response.JSON(bookmarks);
    }
    catch(ERR_HTTP_HEADERS_SENT){
      // Rien à faire, on veut juste que le serveur ne plante pas.
    }
  }

  sort(sortParam, bookmarks){
    // On vérifie s'il y a plusieurs paramètres à utiliser pour le tri.
    if(!Array.isArray(sortParam)){
      let temp = sortParam;
      sortParam = [];
      sortParam.push(temp);
    }

    let nbParam = sortParam.length;
    for (let i = 0; i < nbParam; i++) {
      sortParam[i] = utilities.removeSeparatorAndWhiteSpace(sortParam[i])
      // Reçu en minuscule (ex:name), mais la première lettre est en majuscule dans le modèle.
      sortParam[i] = utilities.capitalizeFirstLetter(sortParam[i]);

      if(sortParam[i] != "Name" && sortParam[i] != "Category"){
        //Le paramètre de tri est invalide.
        const jsonObj = utilities.createJsonErrorBody(
          "La valeur du paramètre sort doit être name ou category.",
          422
        )
        this.response.JSONError(jsonObj,422);
        return;
      }
    }

    // On utilise .sort pour trier notre tableau. On indique à cette fonction de javascript
    // comment trier les éléments du tableau
    bookmarks.sort(function(a, b) {
      let result = 0;
      // On commence par trier avec le premier paramètre.
      // Si le premier paramètre des deux éléments n'est pas égal (!= 0), on quitte la boucle.
      // Sinon, on recommence le tri avec le prochain paramètre.
      for (let i = 0; i < nbParam; i++) {
        result = a[sortParam[i]].toLowerCase() > b[sortParam[i]].toLowerCase() ? 1 :
                 a[sortParam[i]].toLowerCase() < b[sortParam[i]].toLowerCase() ? -1 : 0;
        if(result != 0)
          break;
      }
      return result;
    });

    return bookmarks;
  }

  searchByName(name, bookmarks)
  {
    name = utilities.removeSeparatorAndWhiteSpace(name);
    let foundBookmarks = [];

    if(name.includes("*")){
      //Recherche de tous les noms commençant par ce qui se trouve avant l'étoile (*).
      name = name.slice(0,name.indexOf("*")); //On retire l'étoile
      for(let bookmark of bookmarks){
        // On veut que la recherche ne soit pas dépendante des majuscules et minuscules,
        // donc on transforme tout en minuscules avant de comparer.
        if (bookmark.Name.toLowerCase().startsWith(name)) {
          foundBookmarks.push(bookmark);
        }
      }
    }
    else{
      // Recherche du nom exact.
      for(let bookmark of bookmarks){
        // On veut que la recherche ne soit pas dépendante des majuscules et minuscules,
        // donc on transforme tout en minuscules avant de comparer.
        if (bookmark.Name.toLowerCase() === name.toLowerCase()) {
          foundBookmarks.push(bookmark);
        }
      }
    }
    return foundBookmarks;
  }

  searchByCategory(category, bookmarks){
    category = utilities.removeSeparatorAndWhiteSpace(category);

    let newBookmarks = [];
    for(let bookmark of bookmarks){
      if(bookmark.Category.toLowerCase() === category.toLowerCase()){
        newBookmarks.push(bookmark)
      }
    }
    return newBookmarks;
  }

  // POST: api/contacts body payload[{"Id": 0, "Name": "...", "Email": "...", "Phone": "..."}]
  post(bookmark){
    // Validate contact before insertion and avoid duplicates
    if(!this.validateBookmark(bookmark,"post")){
      return;
    }
    let newBookmark = this.bookmarksRepository.add(bookmark);
    if (newBookmark)
      this.response.created(newBookmark);
    else{
      const jsonObj = utilities.createJsonErrorBody(
        "Le signet n'a pas pu être ajouté.",
        500
      )
      this.response.JSONError(jsonObj,500);
    }
  }
  // PUT: api/contacts body payload[{"Id":..., "Name": "...", "Email": "...", "Phone": "..."}]
  put(bookmark){
    // Validate contact before insertion and avoid duplicates
    if(!this.validateBookmark(bookmark,"put")){
      return;
    }
    if (this.bookmarksRepository.update(bookmark))
      this.response.ok();
    else{
      const jsonObj = utilities.createJsonErrorBody(
        "Aucun signet avec cet Id existe.",
        404
      )
      this.response.JSONError(jsonObj,404);
    }
  }
  // DELETE: api/contacts/{id}
  remove(id){
    if (this.bookmarksRepository.remove(id))
      this.response.accepted();
    else
    {
      const jsonObj = utilities.createJsonErrorBody(
        "Aucun signet avec cet Id existe.",
        404
      )
      this.response.JSONError(jsonObj,404);
    }
  }

  validateBookmark(bookmark, httpVerb){
    // Pas de champ vide, null ou avec seulement des espaces blancs.
    if(!bookmark.Name.trim() || !bookmark.Url.trim() || !bookmark.Category.trim()){
      const jsonObj = utilities.createJsonErrorBody(
        "Les valeur des paramètres ne doivent pas être vide, null ou contenir seulement des espaces blancs.",
        422
      )
      this.response.JSONError(jsonObj,422);
      return false;
    }
    // Pas de doublon de noms
    let bookmarks = this.bookmarksRepository.getAll();
    let foundBookmarks = this.searchByName(bookmark.Name,bookmarks);

    let nameDuplicate = false;

    if(httpVerb === "post"){
      if(foundBookmarks.length != 0)
        nameDuplicate = true;
    }
    else if(httpVerb === "put"){
      // Pour l'update, on veut permettre de garder le même nom, donc on doit vérifier que si le nom existe déjà,
      // est-ce que c'est le nom du signet qu'on veut modifier.
      let currentBookmark = this.bookmarksRepository.get(bookmark.Id);
      if(foundBookmarks.length > 1)
        nameDuplicate = true;
      else if(foundBookmarks.length == 1 && foundBookmarks[0].Name != currentBookmark.Name)
        nameDuplicate = true;
    }

    if(nameDuplicate){
      const jsonObj = utilities.createJsonErrorBody(
        "La valeur du paramètre name existe déjà.",
        422
      )
      this.response.JSONError(jsonObj,422);
      return false;
    }
    return true;
  }
}
