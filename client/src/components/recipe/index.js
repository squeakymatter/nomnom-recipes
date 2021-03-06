import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CardItem from '../utils/card';
import { CardGroup } from 'react-bootstrap';
import { getPost } from '../../store/actions';

const Recipe = (props) => {
  const posts = useSelector((state) => state.posts);
  const dispatch = useDispatch();

  useEffect(() => {
    if (props.match.params.id) {
      dispatch(getPost(props.match.params.id)).then(({ payload }) => {
        if (!payload.singlePost.post) {
          props.history.push('/');
        }
      });
    }
  }, [dispatch, props.match.params.id, props.history]);

  const myPost =
    posts.singlePost && posts.singlePost.post ? posts.singlePost.post : null;
  return (
    <>
      {myPost ? (
        <>
          <h1>{myPost.title}</h1>
          <small>
            Created by {myPost.author.name} {myPost.author.lastname}
          </small>
          <hr />
          <p>{myPost.content}</p>
          <hr />
          <h3>Related posts</h3>
          <CardGroup>
            {myPost.related
              ? myPost.related.map((item, index) => (
                  <CardItem item={item} key={index} />
                ))
              : null}
          </CardGroup>
        </>
      ) : null}
    </>
  );
};

export default Recipe;
