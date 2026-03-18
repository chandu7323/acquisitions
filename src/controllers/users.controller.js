import logger from '#config/logger.js';
import {
  getAllUsers as getAllUsersService,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting all users');
    const allUsers = await getAllUsersService();
    res.json({
      message: 'Users fetched successfully',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(`Error getting users: ${e}`);
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const validatedData = userIdSchema.parse({ params: req.params });
    const id = validatedData.params.id;

    logger.info(`Fetching user with id: ${id}`);
    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User fetched successfully', user });
  } catch (e) {
    logger.error(`Error in getUserById controller: ${e.message}`);
    if (e.name === 'ZodError') {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: e.errors });
    }
    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const validatedData = updateUserSchema.parse({
      params: req.params,
      body: req.body,
    });
    const id = validatedData.params.id;
    const updates = validatedData.body; // Safely stripped of unknown fields by Zod

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({
          message: 'Validation Error',
          errors: 'No valid fields provided for update',
        });
    }

    logger.info(`Updating user with id: ${id}`);

    // Authorization check logic
    if (req.user) {
      const isSelf = req.user.id === id;
      const isAdmin = req.user.role === 'admin';

      // Can only modify their own info
      if (!isSelf && !isAdmin) {
        return res
          .status(403)
          .json({
            message: 'Forbidden: You can only update your own information',
          });
      }

      // Role escalation protection
      if (updates.role && !isAdmin) {
        return res
          .status(403)
          .json({
            message: 'Forbidden: Only administrators can update user roles',
          });
      }
    }

    const updatedUser = await updateUserService(id, updates);
    res
      .status(200)
      .json({ message: 'User updated successfully', user: updatedUser });
  } catch (e) {
    logger.error(`Error in updateUser controller: ${e.message}`);
    if (e.name === 'ZodError') {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: e.errors });
    }
    if (e.message === 'User not found') {
      return res.status(404).json({ message: e.message });
    }
    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const validatedData = userIdSchema.parse({ params: req.params });
    const id = validatedData.params.id;

    logger.info(`Deleting user with id: ${id}`);

    // Authorization check logic
    if (req.user) {
      const isSelf = req.user.id === id;
      const isAdmin = req.user.role === 'admin';

      if (!isSelf && !isAdmin) {
        return res
          .status(403)
          .json({ message: 'Forbidden: You can only delete your own account' });
      }
    }

    await deleteUserService(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (e) {
    logger.error(`Error in deleteUser controller: ${e.message}`);
    if (e.name === 'ZodError') {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: e.errors });
    }
    if (e.message === 'User not found') {
      return res.status(404).json({ message: e.message });
    }
    next(e);
  }
};
