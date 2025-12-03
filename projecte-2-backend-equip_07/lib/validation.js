//functions

export const ValidarEmailPass = async (res,body) => {
    if (!body?.email || !body?.password) {
        return res.status(400).send({
            success: false,
            message: "Falta email o password"
        });
    }
    return null;
}

export const UserExist = async (res, user) =>{
    if(user){
            return res.status(400).send({
                success: false,
                message: "El email ya existe!"
            });
    }
    return null;
}
