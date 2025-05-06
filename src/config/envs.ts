
import 'dotenv/config';
import * as joi from 'joi';


interface EnvvVars {

    PORT : number
    STRIPE_SECRET : string
    SUCCESSS_URL : string
    CANCEL_URL: string
    STRIPE_ENDPOINT_SECRET : string
}

const envSchema = joi.object({
    PORT: joi.number().required(),
    STRIPE_SECRET : joi.string().required(),
    SUCCESSS_URL : joi.string().required(),
    CANCEL_URL: joi.string().required(),
    STRIPE_ENDPOINT_SECRET : joi.string().required()
})
.unknown(true)

const {error, value} = envSchema.validate(process.env);

if(error){
    throw new Error(`Config Error: ${error.message}`)
}

const envVars : EnvvVars = value
export const envs = {
    port : envVars.PORT,
    stripeSecret : envVars.STRIPE_SECRET,
    successsUrl : envVars.SUCCESSS_URL,
    cancelUrl : envVars.CANCEL_URL,
    stripeEndpointSecret : envVars.STRIPE_ENDPOINT_SECRET
}