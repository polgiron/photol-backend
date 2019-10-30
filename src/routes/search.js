import { Router } from 'express';
import * as _ from 'lodash';
import { authGuard } from '../utils/auth-guard.js';

const router = Router();

router.get('/:searchQuery', authGuard, async (req, res) => {
  // console.log('search:');
  // console.log(req.params.searchQuery);

  const searchQueries = req.params.searchQuery.split(' ');

  const results = await performSearch(req, res, searchQueries);
  // console.log(results);

  const response = {
    'results': results
  };

  return res.status(200).send(response);
});

const performSearch = async function(req, res, searchQueries) {
  let results = [];

  await Promise.all(searchQueries.map(async query => {
    // console.log('query: ' + query);

    // Search by date
    const imagesByDate = await searchDates(req, res, query);
    results = results.concat(imagesByDate);

    // Search tags
    const matchingTags = await searchTags(req, res, query);

    // Search albums title
    const matchingAlbums = await searchAlbums(req, res, query);

    // Just add all the results
    matchingTags.map(tag => {
      results = results.concat(tag.images);
    });
    matchingAlbums.map(album => {
      results = results.concat(album.images);
    });
  }));

  // Remove duplicates
  results = removeDuplicates(results);
  // results = results.filter((image, index) => {
  //   return index === results.findIndex(obj => {
  //     return JSON.stringify(obj) === JSON.stringify(image);
  //   });
  // });

  return results;
}

const searchDates = async function(req, res, query) {
  if (!isNaN(query)) {
    return req.context.models.Image.find({
      date: query,
      user: req.payload._id
    }, (err, images) => {
      if (err) return res.status(500).send(err);
      return images;
    }).populate('tags albums').lean();
  } else {
    return [];
  }
}

const searchTags = async function(req, res, query) {
  return req.context.models.Tag.find({
    value: { '$regex': query, '$options': 'i' },
    user: req.payload._id
  }, (err, tags) => {
    if (err) return res.status(500).send(err);
    return tags;
  }).populate({
    path: 'images',
    populate: {
      path: 'tags albums'
    }
  }).lean();
}

const searchAlbums = async function(req, res, query) {
  return req.context.models.Album.find({
    title: { '$regex': query, '$options': 'i' },
    user: req.payload._id
  }, (err, albums) => {
    if (err) return res.status(500).send(err);
    return albums;
  }).populate({
    path: 'images',
    populate: {
      path: 'tags albums'
    }
  }).lean();
}

const removeDuplicates = function(array) {
  return array.reduce((acc, current) => {
    const x = acc.find(item => item._id === current._id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
}

export default router;
