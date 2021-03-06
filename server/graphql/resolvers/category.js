const User = require('../../models/User');
const Post = require('../../models/Post');

module.exports = {
  Category: {
    posts: async (parent, args, context, info) => {
      try {
        const categoryID = parent._id;
        const posts = await Post.find({ category: categoryID });

        return posts;
      } catch (err) {
        throw err;
      }
    },
    author: async (parent, args, context, info) => {
      try {
        const authorID = parent.author;
        const user = await User.findOne({ _id: authorID });

        return {
          ...user._doc,
          password: null,
        };
      } catch (err) {
        throw err;
      }
    },
  },
};
