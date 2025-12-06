from sqlalchemy.orm import Session
from typing import Dict, Tuple, Any

class DatabaseUtils:
    def __init__(self, db: Session) -> None:
        self.db = db

    def db_get(
            self, 
            model, 
            record_id, 
            model_name, 
            error_code=404
    ) -> Tuple[Dict[str, Any], int]:
        """
        Safely retrieve from the database with error handling.
        """
        try:
            res = self.db.get(model, record_id)

        except Exception as e:
            return {
                "success": False,
                "error": f"{model_name} database error: {str(e)}"
            }, 500
        
        if res is None:
            return {
                "success": False,
                "error": f"{model_name} not found"
            }, error_code
        
        return {
            "success": True,
            "data": res
        }, 200
    
    def db_commit(self) -> Tuple[Dict[str, Any], int]:
        """
        Safely commit updates to the database with rollback on failure.
        """
        try:
            self.db.commit()
            return {"success": True}, 200
        
        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": f"Commit failed: {str(e)}"
            }, 500
    
    def db_create(self, instance) -> Tuple[Dict[str, Any], int]:
        """
        Safely add a new record to the database with rollback on failure.
        """
        try:
            self.db.add(instance)
            self.db.commit()
            self.db.refresh(instance)
            return {
                "success": True,
                "data": instance
            }, 200

        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": f"Creation failed: {str(e)}"
            }, 500
        
    def db_delete(self, instance) -> Tuple[Dict[str, Any], int]:
        """
        Safely delete a record from the database with rollback on failure.
        """
        try:
            self.db.delete(instance)
            self.db.commit()
            return {"success": True}, 204
        
        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": f"Deletion failed: {str(e)}"
            }, 500
        
    
        