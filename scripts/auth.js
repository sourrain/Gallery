//get data
db.collection('users').get().then(snapshot => {
  setupGuides(snapshot.docs);
})

// listen for auth status changes
auth.onAuthStateChanged(user => {
  if (user) {
    db.collection('users').onSnapshot(snapshot => {
      setupGuides(snapshot.docs);
      setupUI(user);
    }, err => console.log(err.message));
  } else {
    setupUI();
    setupGuides([]);
  }
});
//artwork data
let file = {}
function chooseFile(e) {
  file = e.target.files[0]
}

// create new guide
const createForm = document.querySelector('#create-form');
createForm.addEventListener('submit', (e) => {
  e.preventDefault();
  //storage the artwork
  const currentUser = auth.currentUser;
 firebase.storage().ref('users/' + currentUser.uid + '/profile.jpg').put(file)
  let url = firebase.storage().ref('users/' + currentUser.uid + '/profile.jpg').getDownloadURL()
  console.log(url)
  //store guides in users uid 
  db.collection('users').doc(currentUser.uid).set({
    title: createForm.title.value,
    content: createForm.content.value,
  }, { merge: true }).then(() => {
    // close the create modal & reset form
    const modal = document.querySelector('#modal-create');
    M.Modal.getInstance(modal).close();
    createForm.reset();
  }).catch(err => {
    console.log(err.message);
  });
});

// signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get user info
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;

  // sign up the user & add firestore data
  auth.createUserWithEmailAndPassword(email, password).then(cred => {
    return db.collection('users').doc(cred.user.uid).set({
      bio: signupForm['signup-bio'].value
    });
  }).then(() => {
    // close the signup modal & reset form
    const modal = document.querySelector('#modal-signup');
    M.Modal.getInstance(modal).close();
    signupForm.reset();
  });
});

// logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut();
});

// login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  // log the user in
  auth.signInWithEmailAndPassword(email, password).then((cred) => {
    // close the signup modal & reset form
    const modal = document.querySelector('#modal-login');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
  });

});