import { Client, Account, ID, Avatars, Databases, Query } from 'react-native-appwrite';

export const appwriteConfig = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.mandrilltech.aora',
  projectId: '66b0f785000efdfdb6c1',
  databaseId: '66b0f9550025b264582a',
  userCollectionId: '66b0f97a000a1c70154f',
  videoCollectionId: '66b0f9ae0006af4021a5',
  storageId: '66b0fb8500385a781972'
}

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

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
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
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
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  }
  catch(error){
    console.log(error)
  }
}