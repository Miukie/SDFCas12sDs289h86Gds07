exports.capitalizeFirstLetter = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1);
}

exports.removeSeparatorAndWhiteSpace = (requestParam) => {
  requestParam = requestParam.trim();
  // Si il y a des guillemets ou des apostrophes au début et à la fin de la valeur, on les enlève.
  // Sinon on fait rien car on veut permettre l'utilisation sans les guillemets ou apostrophes.
  if(requestParam.charAt(0) == "\"" && requestParam.charAt(requestParam.length - 1) == "\"" ||
     requestParam.charAt(0) == "'" && requestParam.charAt(requestParam.length - 1) == "'")
  {
    requestParam = requestParam.slice(1,-1);
    // S'il y a d'autre espace blanc après les séparateurs.
    requestParam = requestParam.trim();
  }
  return requestParam;
}

exports.createJsonErrorBody = (detail,status) => {
  const titleStatus = {
    404:"Non trouvé",
    422:"Paramètres invalides.",
    500:"Erreur interne"
  }

  const jsonObj = {
    title:titleStatus[status],
    detail:detail,
    status:status
  };

  return jsonObj;
}
