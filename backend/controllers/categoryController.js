const Category = require("../models/Category");
const Product = require("../models/Product");
const { successResponse, errorResponse } = require("../utils/response");

const buildSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/-+/g, "-");

// Shapes a Category document into what the storefront (CategoriesPage,
// CategorySection) and the admin dashboard both expect: id, name, image,
// a live product count, and the /shop?category= link used to filter
// products belonging to this category.
const mapCategory = async (category) => {
  const count = await Product.countDocuments({
    category: category.name,
    isActive: true,
  });

  return {
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    isActive: category.isActive,
    count,
    path: `/shop?category=${encodeURIComponent(category.name)}`,
  };
};

/*
==========================================
CREATE CATEGORY
==========================================
*/

const createCategory = async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, "Category name is required", 400);
    }

    const existing = await Category.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });

    if (existing) {
      return errorResponse(
        res,
        "A category with this name already exists",
        400
      );
    }

    const category = await Category.create({
      name: name.trim(),
      slug: buildSlug(name),
      description: description || "",
      image: image || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    return successResponse(
      res,
      "Category created successfully",
      await mapCategory(category),
      201
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
==========================================
GET CATEGORIES (PUBLIC - active only, for storefront)
==========================================
*/

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });

    const mapped = await Promise.all(categories.map(mapCategory));

    return successResponse(res, "Categories fetched successfully", mapped);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
==========================================
GET CATEGORIES (ADMIN - all, incl. inactive)
Used by the admin category list and the product form's category dropdown.
==========================================
*/

const getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });

    const mapped = await Promise.all(categories.map(mapCategory));

    return successResponse(res, "Categories fetched successfully", mapped);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
==========================================
UPDATE CATEGORY
==========================================
*/

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    const { name, description, image, isActive } = req.body;

    if (
      name !== undefined &&
      name.trim() &&
      name.trim().toLowerCase() !== category.name.toLowerCase()
    ) {
      const existing = await Category.findOne({
        _id: { $ne: category._id },
        name: { $regex: `^${name.trim()}$`, $options: "i" },
      });

      if (existing) {
        return errorResponse(
          res,
          "A category with this name already exists",
          400
        );
      }

      // Keep products in sync so they don't silently point at a category
      // name that no longer exists after a rename.
      await Product.updateMany(
        { category: category.name },
        { $set: { category: name.trim() } }
      );

      category.name = name.trim();
      category.slug = buildSlug(category.name);
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    return successResponse(
      res,
      "Category updated successfully",
      await mapCategory(category)
    );
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

/*
==========================================
DELETE CATEGORY
==========================================
*/

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    const productCount = await Product.countDocuments({
      category: category.name,
      isActive: true,
    });

    if (productCount > 0) {
      return errorResponse(
        res,
        `Cannot delete "${category.name}" — ${productCount} product(s) still use this category. Reassign or remove them first.`,
        400
      );
    }

    await category.deleteOne();

    return successResponse(res, "Category deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getAdminCategories,
  updateCategory,
  deleteCategory,
};
