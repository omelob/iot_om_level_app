//If the user has a token, we send it to index
//Si el usuario tiene token lo enviamos a index
export default function({ store, redirect }) {
    store.dispatch('readToken');
    
    // va al dashboard porque tiene token
    if (store.state.auth) {
        return redirect('/dashboard')
    }
} 