import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env';
const { Vonage } = require('@vonage/server-sdk')

export default class Sms extends BaseMailer {
  constructor(private user: User)
  {
    super()
  }


  public async prepare() {
    const vonage = new Vonage({
      apiKey: Env.get('API_KEY'),
      apiSecret: Env.get('API_SECRET'),
    })

    // Datos del usuario
    const from = "Hollow Universe Administration"
    const to = `52${this.user.phone}`
    const text = `Tu codigo de verificacion para hollow universe es ${this.user.code}\n\n\n`

    await vonage.sms.send({to, from, text})
                        .then(resp => { console.log('Mensaje enviado de manera exitosa'); console.log(resp); })
                        .catch(err => { console.log('Hubo un error enviando el mensaje.'); console.error(err); });
  }
}
