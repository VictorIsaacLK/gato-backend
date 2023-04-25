import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Route from '@ioc:Adonis/Core/Route'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Hash from '@ioc:Adonis/Core/Hash';
import Env from '@ioc:Adonis/Core/Env';
import Sms from 'App/Mailers/Sms';
import VerifyEmail from 'App/Mailers/VerifyEmail';
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User';

export default class LogginsController
{
  public async create({request, response}: HttpContextContract)
  {
    const newUserSchema = schema.create({
      name: schema.string({
        trim: true, escape: true
      }, [
        rules.required(),
        rules.maxLength(100),
        rules.minLength(3)
      ]),
      email: schema.string({
        trim: true
      }, [
        rules.required(),
        rules.email(),
        rules.unique({ table: 'users', column : 'email'})
      ]),
      password: schema.string({
        trim: true
      }, [
        rules.required(),
        rules.minLength(4)
      ]),
      phone: schema.string({
        trim: true, escape: true
      }, [
        rules.required(),
        rules.minLength(10),
        rules.maxLength(10)
      ]),
    });

    const payload = await request.validate
    ({schema: newUserSchema,
      messages:
      {
        "name.required": "El nombre es requerido",
        "name.string": "El nombre debe ser un texto",
        "name.minLength": "El nombre debe tener al menos 3 caracteres",
        "name.maxLength": "El nombre debe tener como máximo 100 caracteres",

        "email.required": "El email es requerido",
        "email.string": "El email debe ser un texto",
        "email.email": "El email debe ser un email válido",
        "email.unique": "El email ya está en uso",

        "password.required": "La contraseña es requerida",
        "password.string": "La contraseña debe ser un texto",
        "password.minLength": "La contraseña debe tener al menos 4 caracteres",

        "telefono.required": "El teléfono es requerido",
        "telefono.minLength": "Debe tener al menos 10 caracteres",
        "telefono.maxLength": "Debe tener como máximo 10 caracteres",
      }})

    payload['password'] = await Hash.make(payload['password'])
    const code = (Math.floor(Math.random() * 8999) - 33).toString()
    payload['code'] = code
    payload['role_id'] = 2
    const user = await User.create(payload)

    if(user)
    {
      const signedUrl = Route.makeSignedUrl('verifyEmail',
      {id: user.id}, {expiresIn: '30m', prefixUrl: Env.get('APP_URL')})

      ////////////////////////////////////////////////////////////////
      if(signedUrl)
      {
        const emailMessage = await new VerifyEmail(user, signedUrl)
        emailMessage.sendLater()

        return response.status(201).send({
          message: 'Revisa tu correo para activar tu cuenta!',
          user: user,
          url: signedUrl
        })
      }
      else
      {
        return response.status(400).send({
          message: 'No se pudo enviar el correo de confirmacion'
        })
      }
    }

  }

  /////////////////////////////////////////////////////////////////
  public async verifyEmail({response, params}: HttpContextContract)
  {
    const user = await User.findOrFail(params.id)
    /* console.log(user)
    debugger */ //si trae al usuario mientras se pase el id
    if(user.status == true){
      return response.badRequest({message: 'Usuario ya activo'})
    }
    else
    {
      const sms = await new Sms(user)
      sms.sendLater()
      const signedUrl = Route.makeSignedUrl('verifyCode',
      {id: user.id}, {expiresIn: '30m', prefixUrl: Env.get('APP_URL')})
      return response.ok({message: 'El correo ha sido enviado a tu celular', url: signedUrl})
    }

  }

  /////////////////////////////////////////////////////////////////
  public async verifyCode({request, response}: HttpContextContract)
  {
    const newCodeSchema = schema.create({
      code: schema.string({trim: true, escape: true}, [rules.maxLength(4), rules.minLength(4)])
    });

    const payload = await request.validate({
      schema: newCodeSchema
    });

    const user = await Database.from('users').where('code', payload['code']).firstOrFail()
    if(user)
    {
      await Database.from('users').where('id', user.id).update({status: true})
      return response.ok({message: 'El usuario ha sido dado de alta de manera satisfactoria'})
    }
    else
    {
      return response.badRequest({message: 'Este codigo no es valido'})
    }

    /* if(payload['code'] == user.code) */
  }

  public async login({request, response, auth})
  {
    const newLogginSchema = schema.create({
      email: schema.string({
        trim: true
      }, [
        rules.required(),
        rules.email(),
        rules.exists({table: 'users', column: 'email'})
      ]),
      password: schema.string({
        trim: true
      }, [
        rules.required(),
        rules.minLength(4)
      ]),
    });

    const payload = await request.validate
    ({schema: newLogginSchema,
      messages:
      {
        "email.required": "El email es requerido",
        "email.email": "El email debe ser un email válido",
        "email.exist": "El email debe haber sido registrado",

        "password.required": "La contraseña es requerida",
        "password.minLength": "La contraseña debe tener al menos 4 caracteres"
      }
    });

    const user = await User.findBy('email', payload['email'])
    if(user?.status == false)
    {
      return response.status(401).send({error: [{message: 'Usuario no activado'}]})
    }
    else if(user?.status == true)
    {
      const comparacionPassword = await Hash.verify(user.password, payload['password'])
      if(comparacionPassword)
      {
        const token = await auth.use('api').attempt(payload['email'], payload['password'])
        return response.ok({token})
      }
      else
      {
        return response.status(401).send({error: [{message: 'Contraseña incorrecta'}]})
      }
    }

  }

  public async logout({auth, response})
  {
    await auth.logout();
    return response.status(200).send({message: 'Sesión cerrada'})
  }
}
