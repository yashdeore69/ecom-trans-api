from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserOut(UserBase):
    id: int
    balance: float
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

# Transaction Schemas
class TransactionBase(BaseModel):
    amount: float
    type: str = Field(..., max_length=20)
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: int
    user_id: int
    status: str
    created_at: datetime

    class Config:
        orm_mode = True

# Log Schemas
class LogBase(BaseModel):
    action: str
    detail: Optional[str] = None

class LogCreate(LogBase):
    pass

class LogOut(LogBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        orm_mode = True