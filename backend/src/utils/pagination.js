export const buildPaginationOptions = (req) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let sort = {};
  if (req.query.sort) {
    const fields = req.query.sort.split(",");
    fields.forEach((field) => {
      const [key, order] = field.split(":");
      sort[key] = order === "desc" ? -1 : 1;
    });
  } else {
    sort = { createdAt: -1 };
  }

  return { page, limit, skip, sort };
};

