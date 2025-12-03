import { useState, useContext, useEffect } from "react";
import { UserAuth } from '../providers/AuthProvider'

export default function Login() {
    const ruta_api = import.meta.env.VITE_API_URL;
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {setToken} = useContext(UserAuth)
    const [error, setError] = useState('')

    useEffect(()=> {
      const timer = setTimeout(()=> {
        setError('')
      }, 2000);
      return () => clearTimeout(timer);
    },[error])

    const subirLogin = async (e) => {
        e.preventDefault(); 
        
        if(!email || !password) {
            console.log("Rellena todos los datos!");
            const error = 'Faltan datos!'
            setError(error)
            return;
        }

        try{    
            const res = await fetch (`${ruta_api}/auth/login`, {
                method: "POST",
                headers: {
                    'Content-Type' : 'application/json',
                },
                body: JSON.stringify({"email": email, "password": password})
            })

            if(!res.ok) {
                throw new Error("Error a la hora de hacer login!")
            }

            const data = await res.json()
            
            console.log(data)
            if(!data.success) {
              console.log("Datos incorrectos!")
              const error = 'Los datos son incorrectos!'
              setError(error)
            }

            if(data.success) {
                localStorage.setItem("accessToken",data.data.accessToken)
                setToken(data.data.accessToken)
            }

        }  catch (err) {
           console.log(err.message)
        }
    }

    return (
        <div className="container border rounded p-4" style={{ maxWidth: "500px" }}>
            <h2 className="mb-4 text-center">Iniciar sesión</h2>

            <form onSubmit={subirLogin}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correo electrónico</label>
                    <input
                        type="text"
                        className="form-control"
                        id="email"
                        placeholder="Ejemplo: alex@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Escribe tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && (
                    <div className="d-flex justify-content-center text-white p-2 mb-3 rounded bg-danger">
                        {error}
                    </div>
                )}

                <button type="submit" className="btn btn-primary w-100 mt-3">Entrar</button>
            </form>
        </div>
    );

}