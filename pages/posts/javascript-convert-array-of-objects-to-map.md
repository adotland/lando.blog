---
title: "📍 Maps in Javascript: Converting Arrays of Objects"
date: "2022-06-26"
description: "Using Maps in Javascript to make object data lookup more efficient"
tag: "web development, javascript, map, array, object"
author: "lando"
---

import Head from 'next/head';
import ScrollTop from '../../components/ScrollTop';
import ReadingTime from '../../components/ReadingTime';

<Head>
  <meta name="title" content="Maps in Javascript: Converting Arrays of Objects" />
  <meta name="description" content="Using Maps in Javascript to make object data lookup more efficient" />
  <meta name="keywords" content="web development, javascript, map, array, object" />
  <meta property="og:description" content="Using Maps in Javascript to make object data lookup more efficient" />
  <meta property="og:title" content="Maps in Javascript: Converting Arrays of Objects" />
  <link rel="canonical" href="https://www.lando.blog/posts/javascript-convert-array-of-objects-to-map" />
  <title>Maps in Javascript: Converting Arrays of Objects - lando.blog</title>
</Head>

# Array -> Map

<img src="/images/hans-isaacson-NLfvLYxR-lA-unsplash.jpg" alt="Map image" />

<ReadingTime />

## Problem

Say you have an array of objects, such as the result of a database query, and you want to find various objects from the list.

Converting an array of objects into a single key-value object is an efficient way to get this done.

Often we find ourselves needing a particular peice of data at a given time from a data store.

A common example is when we want data from a row in a database. Let's say we are creating a loop where we will need the age for every user. Our list of users is coming from one data source, and user age data is coming from a different source, and the two sources are not connected. In this case, we will have to match the user's name to the user's data manually in code.

## Solutions

We can query the database for all user ages, and let's give ourselves an easy way to match the data, an id column.

```sql
SELECT id,age from Users
```

```js
const userAgeArray = await SOME_ORM.users.getAll(['id', 'age']);
// [{id: 1, age: 10}, {id: 2, age: 20}, {id: 3, age: 30}]

const userIdArray = [1,2,3] // from some other source
```

In the above example, we may think to adjust our SQL query to give us exactly the age data needed, in exactly the right order by id

However, in doing that, your two datasources are not strongly coupled. Depending on the SQL results, they may be out of sync and you would need some error checking to ensure the data is aligned.

```js
// ASSUMING IN ORDER
userIdArray.forEach((id, index) => {
  console.log(userIdArray[index], userAgeArray[index]);
})
```
If we don't want to assume data is in order, one may think to use Array.filter() on the age list in order to get the correct object in the loop:

```js
// COSTLY
userIdArray.forEach((id, index) => {
  const ageData = userAgeArray.filter((data) => data.id === id)
  console.log(userIdArray[index], ageData[0].age)
})
```
The above solution is not as clean, and more importantly, very costly in doing a filter call for every iteration.

A more general approach that does not need to assume data is in order is to create a map of the database results array.

We can do this with any loop, but let's use the [Array.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) function on our array to output an object:

```js
const userAgeObj = userAgeArray.reduce((a, c) => {
  a[c.id] = c
  return a
}, {})
```
We now have an object keyed by id that we can use to directly access the data we need in our loop:

```js
// OBJECT
userIdArray.forEach((id) => {
  console.log(id, userAgeObj[id].age);
})
```
We can take this a step further and use the [ES6/ES2015 Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) data type

```javascript
const userAgeMap = userAgeArray.reduce((a, c) => {
  a.set(c.id, c)
  return a
}, new Map)

// MAP
userIdArray.forEach((id) => {
  console.log(id, userAgeMap.get(id).age);
})
```

## Performance

We touched on performance earlier, how well do each of the above solutions perform?

Given the above solutions with 10k rows:

---

### let's see the numbers

| **operation**  | **time**   |
| -------------- | ---------- |
| ordered lookup | 0.566 ms   |
| filter lookup  | 902.112 ms |
| object lookup  | 0.546 ms   |
| map lookup     | 0.884 ms   |

---

### How about the time to create the Object/Map?

| **operation** | **time** |
| ------------- | -------- |
| SQL sort*     | 1.5 ms   |
| create object | 0.787 ms |
| create map    | 1.622 ms |

* estimated since SQL sort times will vary depending on db type, indexes created, etc.

---

### Totals

| **operation**  | **time**   |
| -------------- | ---------- |
| ordered lookup | 2.066 ms   |
| filter lookup  | 902.112 ms |
| object lookup  | 1.333 ms   |
| map lookup     | 2.506 ms   |

---

## Optimization

Now that we have some numerical evidence, we can fine tune.

Plain Javascript objects are performing faster than Maps in this case due in part to the type of data we are using, sparse and numerically keyed. Also, maps are generally better for memory consumption.

The simplest optimization here is to replace the forEach loop with a plain for loop. When iterating over large amounts of data, for loop is typically faster.

```js
for (let i = 0, len = userIdArray.length; i < len; i++) {
  const age = userAgeObj[userIdArray[i]].age
}
```

---

## Results

| **operation**          | **time** | **memory** |
| ---------------------- | -------- | ---------- |
| object lookup forEach  | 0.548ms  |
| object lookup for-loop | 0.374ms  |

---

Final total time (object lookup for-loop): **1.707 ms**

---

## Code

[View on StackBlitz](https://stackblitz.com/edit/node-cgq7q5?file=index.js)

---

## Conclusion

It appears the plain Javascript constructs were the top performers for this test. When performance matters, i.e. when miliseconds count towards your browser render time, or when you are paying for execution time on a server, the types of considerations taken above can really pay off.

---



<ScrollTop />
