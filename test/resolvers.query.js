/*  eslint mocha/no-mocha-arrows: 0 */
/*  eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }]  */

process.env.NODE_ENV = 'test';

const chai = require('chai');
const { Query } = require('../server/src/resolvers.js');
const PostAPI = require('../server/src/datasources/PostAPI.js');
const UserAPI = require('../server/src/datasources/UserAPI.js');
const CommentAPI = require('../server/src/datasources/CommentAPI.js');
const db = require('../db/models');
const { getUser, getPost, getComment } = require('../__fixtures__/entitiesData.js');
const { encrypt } = require('../server/lib/secure.js');
const setContext = require('../__fixtures__/utils.js');

const should = chai.should();

let context;
let userData;
let postsData;
let commentsData;
const dataSources = () => ({
  postAPI: new PostAPI(db),
  userAPI: new UserAPI(db),
  commentAPI: new CommentAPI(db),
});

describe('Check query', () => {
  let user;

  before(() => {
    userData = getUser();
    postsData = [getPost(), getPost(), getPost()];
    commentsData = [getComment(), getComment(), getComment()];
    context = { dataSources: dataSources() };
  });

  beforeEach(async () => {
    await db.sequelize.sync({ force: true });
    user = await db.User.create({ ...userData, password: encrypt(userData.password) });
    context = setContext(context, user);
    await postsData.forEach((postData) => db.Post.create({ ...postData, author_id: user.id }));
    await commentsData.forEach((commentData) => db.Comment.create({
      ...commentData,
      author_id: user.id,
      post_id: 1,
    }));
  });

  it('Check getPostById', async () => {
    const post = await Query.getPostById(null, { id: 2 }, context);
    post.should.be.include(postsData[1]);
  });

  it('Check getPostsList', async () => {
    const posts = await Query.getPostsList(null, { page: 2, perPage: 1 }, context);
    posts.posts.isArray; // eslint-disable-line chai-friendly/no-unused-expressions
    posts.totalPages.should.be.equal(3);
    posts.lastPage.should.be.false;
  });

  it('Check getUserComments', async () => {
    const comments = await Query.getUserComments(null, { userId: 1, page: 2, perPage: 1 }, context);
    comments.comments.isArray; // eslint-disable-line chai-friendly/no-unused-expressions
    comments.totalPages.should.be.equal(3);
    comments.lastPage.should.be.false;
  });
});
