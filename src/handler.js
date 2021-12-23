const { nanoid } = require('nanoid');
const books = require('./books');

const STATUS = {
  SUCCESS: 'success',
  FAIL: 'fail',
  ERROR: 'error',
};

const addBookHandler = (req, h) => {
  const bookInfo = req.payload;

  const { name, pageCount, readPage } = bookInfo;

  const id = nanoid(16);
  const finished = (pageCount === readPage);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    ...bookInfo,
    finished,
    insertedAt,
    updatedAt,
  };

  if (name === undefined) {
    const res = h.response({
      status: STATUS.FAIL,
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    res.code(400);
    return res;
  }

  if (readPage > pageCount) {
    const res = h.response({
      status: STATUS.FAIL,
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    res.code(400);
    return res;
  }

  books.push(newBook);

  const isSuccess = books.includes(newBook);

  if (isSuccess) {
    const res = h.response({
      status: STATUS.SUCCESS,
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    res.code(201);
    return res;
  }

  const res = h.response({
    status: STATUS.ERROR,
    message: 'Buku gagal ditambahkan',
  });
  res.code(500);
  return res;
};

const getAllBooksHandler = (req, h) => {
  const { name, reading, finished } = req.query;

  let allBooks = [...books];

  if (name !== undefined) {
    allBooks = allBooks.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
  }
  if (reading !== undefined && ['0', '1'].includes(reading)) {
    const isBeingRead = (reading === '1');
    allBooks = allBooks.filter((book) => book.reading === isBeingRead);
  }
  if (finished !== undefined && ['0', '1'].includes(finished)) {
    const isFinished = (finished === '1');
    allBooks = allBooks.filter((book) => book.finished === isFinished);
  }

  const res = h.response({
    status: STATUS.SUCCESS,
    data: {
      books: allBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  res.code(200);
  return res;
};

const getBookByIdHandler = (req, h) => {
  const { bookId } = req.params;

  const book = books.filter((b) => b.id === bookId)[0];

  if (book !== undefined) {
    const res = h.response({
      status: STATUS.SUCCESS,
      data: { book },
    });
    res.code(200);
    return res;
  }

  const res = h.response({
    status: STATUS.FAIL,
    message: 'Buku tidak ditemukan',
  });
  res.code(404);
  return res;
};

const updateBookByIdHandler = (req, h) => {
  const { bookId } = req.params;
  const updatedBookInfo = req.payload;

  const { name, readPage, pageCount } = updatedBookInfo;
  const finished = (pageCount === readPage);
  const updatedAt = new Date().toISOString();

  if (name === undefined) {
    const res = h.response({
      status: STATUS.FAIL,
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    res.code(400);
    return res;
  }

  if (readPage > pageCount) {
    const res = h.response({
      status: STATUS.FAIL,
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    res.code(400);
    return res;
  }

  const idx = books.findIndex((book) => book.id === bookId);

  if (idx === -1) {
    const res = h.response({
      status: STATUS.FAIL,
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    res.code(404);
    return res;
  }

  books[idx] = {
    ...books[idx],
    ...updatedBookInfo,
    finished,
    updatedAt,
  };

  const res = h.response({
    status: STATUS.SUCCESS,
    message: 'Buku berhasil diperbarui',
  });
  res.code(200);
  return res;
};

const deleteBookByIdHandler = (req, h) => {
  const { bookId } = req.params;

  const idx = books.findIndex((book) => book.id === bookId);

  if (idx === -1) {
    const res = h.response({
      status: STATUS.FAIL,
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    });
    res.code(404);
    return res;
  }

  books.splice(idx, 1);
  const res = h.response({
    status: STATUS.SUCCESS,
    message: 'Buku berhasil dihapus',
  });
  res.code(200);
  return res;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookByIdHandler,
  deleteBookByIdHandler,
};
