from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scipy.optimize import minimize
import numpy as np

app = FastAPI()

# Reactからのアクセスを許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OptimizeRequest(BaseModel):
    cx: float
    cy: float
    epsilon: float

@app.post("/optimize")
def solve_optimization(req: OptimizeRequest):
    """
    目的関数: min cx*x + cy*y + (epsilon/2)*(x^2 + y^2)
    制約: 
      0 <= x <= 1
      0 <= y <= 1
      x + y <= 1
    """
    
    # 目的関数
    def objective(vars):
        x, y = vars
        linear_term = req.cx * x + req.cy * y
        quadratic_term = (req.epsilon / 2.0) * (x**2 + y**2)
        return linear_term + quadratic_term

    # 制約条件 (scipyの形式)
    # x + y <= 1  =>  1 - x - y >= 0
    cons = ({'type': 'ineq', 'fun': lambda x:  1 - x[0] - x[1]})
    
    # 変数の範囲 (0 <= x <= 1, 0 <= y <= 1)
    bnds = ((0, 1), (0, 1))

    # 初期値（適当な実行可能解）
    x0 = [0.1, 0.1]

    # 最適化実行 (SLSQP法は制約付き問題に適している)
    result = minimize(objective, x0, method='SLSQP', bounds=bnds, constraints=cons)

    return {
        "x": result.x[0],
        "y": result.x[1],
        "objective_value": result.fun,
        "success": result.success
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)