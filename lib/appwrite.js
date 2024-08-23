import { Client, Account, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite';
// import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

export const appwriteConfig = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.mandrilltech.aora',
  projectId: '66b0f785000efdfdb6c1',
  databaseId: '66b0f9550025b264582a',
  userCollectionId: '66b0f97a000a1c70154f',
  videoCollectionId: '66b0f9ae0006af4021a5',
  storageId: '66b0fb8500385a781972'
}

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId
} = appwriteConfig;

const client = new Client();

client
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setPlatform(platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export async function createUser(email, password, username){
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if(!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        accountId: newAccount .$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } 
  catch (error) {
    console.log(error.message);
    throw new Error(error)
  }
}

export async function signIn(email, password){
  try {
    await account.deleteSession("current");
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } 
  catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
}

export async function getCurrentUser(){
  try{
    const currentAccount = await account.get();

    if(!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  }
  catch(error){
    console.log(error)
  }
}

export async function getAllPosts(){
  try {
    const posts = await databases.listDocuments(
      databaseId, videoCollectionId
    )

    return posts.documents;
  } 
  catch (error) {
    throw new Error(error);
  }
}

export async function getLatestPosts(){
  try {
    const latestPosts = await databases.listDocuments(
      databaseId, videoCollectionId, [Query.orderDesc('$createdAt', Query.limit(7))]
    )

    return latestPosts.documents;
  } 
  catch (error) {
    throw new Error(error);
  }
}

export async function searchPosts(query){
  try {
    const posts = await databases.listDocuments(
      databaseId, videoCollectionId, [Query.search('title', query)]
    )

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } 
  catch (error) {
    throw new Error(error);
  }
}

export async function getUserPosts(userId){
  try {
    const posts = await databases.listDocuments(
      databaseId, videoCollectionId, [Query.equal('creator', userId)]
    )

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } 
  catch (error) {
    throw new Error(error);
  }
}

export async function signOut(){
  try {
    const session = await account.deleteSession('current');

    return session;
  }
  catch (error) {
    throw new Error(error.message);  
  }
}

export async function getFilePreview(fileId, type){
  let fileUrl;

  try {
    if(type === 'video'){
      fileUrl = storage.getFileView(storageId, fileId);
    }
    else if(type === 'image'){
      fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100);
    }
    else {
      throw new Error("Invalid file type");
    }

    if(!fileUrl) throw Error;

    return fileUrl;
  } 
  catch (error) {
    console.log(error.message);
    throw new Error(error.message);  
  }
}

export async function uploadFile(file, type){
  if(!file) return;

  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri
  };

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    console.log('File url: ', fileUrl)
    return fileUrl;
  } 
  catch (error) {
    console.log(error.message);
    throw new Error(error.message)
  }
}

export async function createVideoPost(form){
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all(
      [
        uploadFile(form.thumbnail, 'image'),
        uploadFile(form.video, 'video')
      ]
    );

    console.log("Thumbnail url: ", thumbnailUrl);
    console.log("Video url: ", videoUrl);

    const newPost = await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );

    if(!newPost) console.log("Error creating new post");

    console.log(newPost);

    return newPost;
  } 
  catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
}