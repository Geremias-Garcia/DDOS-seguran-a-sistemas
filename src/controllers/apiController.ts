import { Request, Response } from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { Usuario } from '../models/Usuario';
import { Notificacao } from '../models/Notificacao';

// Middleware de Limitação de Requisições
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // Máximo de 10 requisições por IP
    message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
});

// Configuração de Logs com Morgan
const logFilePath = path.join(__dirname, '../logs/access.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Middleware de Logs
export const requestLogger = morgan('combined', { stream: logStream });

// Aplicando o middleware global de logs
export const app = express();
app.use(requestLogger); // Vai logar todas as requisições no arquivo 'access.log'

// Rotas e Controladores
export const ping = (req: Request, res: Response) => {
    res.json({ pong: true });
};

export const cadastrarUsuario = async (req: Request, res: Response) => {
    const { nome, email, senha, disciplina } = req.body;
    if (email && senha && nome && disciplina) {
        let usuarioExistente = await Usuario.findOne({ where: { email } });
        if (!usuarioExistente) {
            let novoUsuario = await Usuario.create({ email, senha, nome, disciplina });
            res.status(201).json({
                message: "Usuário cadastrado com sucesso.",
                novoUsuario,
            });
        } else {
            res.status(400).json({ error: 'E-mail já existe.' });
        }
    } else {
        res.status(400).json({ error: 'E-mail e/ou senha não enviados.' });
    }
};

export const fazerLogin = async (req: Request, res: Response) => {
    if (req.body.email && req.body.senha) {
        const { email, senha } = req.body;
        const usuario = await Usuario.findOne({ where: { email, senha } });
        if (usuario) {
            res.json({ status: true });
            return;
        }
    }
    res.json({ status: false });
};

export const listarEmails = async (req: Request, res: Response) => {
    const usuarios = await Usuario.findAll();
    const listaEmails = usuarios.map((u) => u.email);
    res.json({ listaEmails });
};

export const listarTodosUsuarios = async (req: Request, res: Response) => {
    const usuarios = await Usuario.findAll();
    res.json({ usuarios });
};

export const deletarUsuario = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await Usuario.findByPk(id);
        if (user) {
            const deletedUserName = user.nome;
            await user.destroy();
            res.status(200).json({ message: `Usuário ${deletedUserName} foi removido com sucesso.` });
        } else {
            res.status(404).json({ message: `Usuário com ID ${id} não encontrado.` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover o usuário.', error });
    }
};

export const atualizarUsuario = async (req: Request, res: Response) => {
    const { id } = req.params;
    const valores = req.body;

    if (Object.values(valores).some((valor) => valor === null || valor === '')) {
        return res.status(400).json({ mensagem: 'Dados incompletos.' });
    }

    try {
        const usuarioEncontrado = await Usuario.findOne({ where: { id } });
        if (!usuarioEncontrado) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }
        await Usuario.update(valores, { where: { id } });
        const usuarioAtualizado = await Usuario.findOne({ where: { id } });
        res.status(200).json({ mensagem: 'Usuário atualizado com sucesso.', usuarioAtualizado });
    } catch (erro) {
        res.status(500).json({ mensagem: 'Erro ao atualizar usuário.', erro });
    }
};

export const pegarUsuarioPeloId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const usuario = await Usuario.findByPk(id);
        res.status(200).json({ message: `Usuário encontrado`, usuario });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuário pelo ID.', error });
    }
};

export const mostrarNotificacao = async (req: Request, res: Response) => {
    const notificacao = await Notificacao.findAll();
    res.json({ notificacao });
};

export const atualizarNotificacao = async (req: Request, res: Response) => {
    const { titulo, corpo, mostrar } = req.body;

    if (titulo && corpo && mostrar) {
        try {
            const notificacaoExistente = await Notificacao.findOne();
            if (notificacaoExistente) {
                notificacaoExistente.titulo = titulo;
                notificacaoExistente.corpo = corpo;
                notificacaoExistente.mostrar = mostrar;
                await notificacaoExistente.save();
                res.status(200).json({ message: "Notificação atualizada com sucesso.", notificacao: notificacaoExistente });
            } else {
                res.status(404).json({ error: 'Notificação não encontrada.' });
            }
        } catch (error) {
            res.status(500).json({ 
                error: 'Erro interno no servidor.', 
                details: error 
            });
        }
    } else {
        res.status(400).json({ error: 'Campos inválidos.' });
    }
};
