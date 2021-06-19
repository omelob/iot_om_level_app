//If the user does not have a token, we send it to login
//si el usuario no tiene token lo enviamos a login
export default function({ store, redirect }) {
  
  // readToken es un metodo creado en el store/index.js
  store.dispatch("readToken");

  if (!store.state.auth) {
    return redirect("/login");
  }
}
// con dispatch se llaman acciones
// con conmmit se llaman mutaciones