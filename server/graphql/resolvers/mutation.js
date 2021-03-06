const User = require('../../models/User');
const Post = require('../../models/Post');
const Category = require('../../models/Category');

const {
  UserInputError,
  AuthenticationError,
  ApolloError,
} = require('apollo-server-express');
const authorize = require('../../utils/isAuth');
const { userOwnership } = require('../../utils/tools');

module.exports = {
  Mutation: {
    authUser: async (parent, args, context, info) => {
      try {
        const user = await User.findOne({
          email: args.fields.email,
        });
        if (!user) {
          throw new AuthenticationError('Incorrect Email or Password');
        }

        const checkpass = await user.comparePassword(args.fields.password);
        if (!checkpass) {
          throw new AuthenticationError('Wrong password');
        }

        const getToken = await user.generateToken();
        if (!getToken) {
          throw new AuthenticationError(
            'Something went wrong. Please try again'
          );
        }

        return {
          _id: user._id,
          email: user.email,
          token: getToken.token,
        };
      } catch (err) {
        throw err;
      }
    },
    signUp: async (parent, args, context, info) => {
      try {
        const user = new User({
          email: args.fields.email,
          password: args.fields.password,
        });

        const getToken = await user.generateToken();
        if (!getToken) {
          throw new AuthenticationError(
            'Something went wrong. Please try again'
          );
        }

        return { ...getToken._doc };
      } catch (err) {
        throw new ApolloError(
          'Something went wrong. Please try again',
          null,
          err
        );
      }
    },
    updateUserProfile: async (parent, args, context, info) => {
      try {
        const req = authorize(context.req);

        if (!userOwnership(req, args._id))
          throw new AuthenticationError(
            'Something went wrong. Please try again'
          );

        const user = await User.findOneAndUpdate(
          { _id: args._id },
          {
            $set: {
              name: args.name,
              lastname: args.lastname,
            },
          },
          { new: true }
        );
        return { ...user._doc };
      } catch (err) {
        throw err;
      }
    },
    updateUserEmailPass: async (parent, args, context, info) => {
      try {
        const req = authorize(context.req);

        if (!userOwnership(req, args._id))
          throw new AuthenticationError(
            "'Something went wrong. Please try again'"
          );

        const user = await User.findOne({ _id: req._id });
        if (!user)
          throw new AuthenticationError(
            "'Something went wrong. Please try again'"
          );

        if (args.email) {
          user.email = args.email;
        }
        if (args.password) {
          user.password = args.password;
        }

        const getToken = await user.generateToken();
        if (!getToken) {
          throw new AuthenticationError(
            'Something went wrong. Please try again'
          );
        }

        return { ...getToken._doc, token: getToken.token };
      } catch (err) {
        throw new ApolloError('Something went wrong, try again', err);
      }
    },
    createPost: async (parent, { fields }, context, info) => {
      try {
        const req = authorize(context.req);

        const post = new Post({
          title: fields.title,
          excerpt: fields.excerpt,
          content: fields.content,
          author: req._id,
          status: fields.status,
          category: fields.category,
        });
        const result = await post.save();
        return { ...result._doc };
      } catch (err) {
        throw err;
      }
    },
    createCategory: async (parent, args, context, info) => {
      try {
        const req = authorize(context.req);

        const category = new Category({
          author: req._id,
          name: args.name,
        });
        const result = await category.save();
        return { ...result._doc };
      } catch (err) {
        throw err;
      }
    },
    updatePost: async (parent, { fields, postId }, context, info) => {
      try {
        const req = authorize(context.req);
        const post = await Post.findOne({ _id: postId });

        if (!userOwnership(req, post.author))
          throw new AuthenticationError(
            'You are not authorized to perform this action.'
          );

        for (key in fields) {
          if (post[key] != fields[key]) {
            post[key] = fields[key];
          }
        }

        const result = await post.save();
        return { ...result._doc };
      } catch (err) {
        throw err;
      }
    },
    deletePost: async (parent, { postId }, context, info) => {
      try {
        const req = authorize(context.req);
        const post = await Post.findByIdAndRemove(postId);
        if (!post)
          throw new UserInputError(
            'Sorry.Not able to find your post or it was deleted already'
          );

        return post;
      } catch (err) {
        throw err;
      }
    },
    updateCategory: async (parent, { catId, name }, context, info) => {
      try {
        const req = authorize(context.req);
        const category = await Category.findOneAndUpdate(
          { _id: catId },
          {
            $set: {
              name,
            },
          },
          { new: true }
        );

        return { ...category._doc };
      } catch (err) {
        throw err;
      }
    },
    deleteCategory: async (parent, { catId }, context, info) => {
      try {
        const req = authorize(context.req);
        const category = await Category.findByIdAndRemove(catId);
        if (!category)
          throw new UserInputError('Category already deleted or not found.');

        return category;
      } catch (err) {
        throw err;
      }
    },
  },
};
