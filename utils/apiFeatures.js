class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search() {
    if (this.queryString.keyword) {
      this.query = this.query.find({ $text: { $search: this.queryString.keyword } });
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    ['keyword', 'page', 'limit', 'sort', 'fields'].forEach((f) => delete queryObj[f]);
    let queryStr = JSON.stringify(queryObj).replace(/\b(gt|gte|lt|lte)\b/g, (m) => `$${m}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    this.query = this.query.sort(
      this.queryString.sort ? this.queryString.sort.split(',').join(' ') : '-createdAt'
    );
    return this;
  }

  limitFields() {
    this.query = this.query.select(
      this.queryString.fields ? this.queryString.fields.split(',').join(' ') : '-__v'
    );
    return this;
  }

  paginate() {
    const page  = parseInt(this.queryString.page,  10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 12;
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    this.page  = page;
    this.limit = limit;
    return this;
  }
}

export default APIFeatures;
