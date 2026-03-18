import logger from "#config/logger.js"
import { db } from "#config/database.js";
import { users } from "#models/user.model.js";
import { eq } from "drizzle-orm";

export const getAllUsers = async() =>{
    try{
        return await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            created_at: users.created_at,
            updated_at: users.updated_at
        }).from(users);
    }catch(e){
        logger.error(`Error getting users: ${e}`);
        throw e;
    
    }
}

export const getUserById = async(id) => {
    try {
        const result = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            created_at: users.created_at,
            updated_at: users.updated_at
        }).from(users).where(eq(users.id, id));
        
        return result[0];
    } catch(e) {
        logger.error(`Error getting user by id: ${e}`);
        throw e;
    }
}

export const updateUser = async(id, updates) => {
    try {
        const user = await getUserById(id);
        if (!user) {
            throw new Error("User not found");
        }
        
        const updated = await db.update(users)
            .set({ ...updates, updated_at: new Date() })
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                created_at: users.created_at,
                updated_at: users.updated_at
            });
            
        return updated[0];
    } catch(e) {
        logger.error(`Error updating user: ${e}`);
        throw e;
    }
}

export const deleteUser = async(id) => {
    try {
        const deleted = await db.delete(users)
            .where(eq(users.id, id))
            .returning({ id: users.id });
            
        if (!deleted.length) {
            throw new Error("User not found");
        }
        return deleted[0];
    } catch(e) {
        logger.error(`Error deleting user: ${e}`);
        throw e;
    }
}