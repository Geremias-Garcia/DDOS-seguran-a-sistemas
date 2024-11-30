# DDOS-seguran-a-sistemas

Para evitar ataques ddos, pesquisei ferramentas que poderiam limitar o número de requisições feitas por um mesmo IP em determinado limite de tempo.

Instalei na raiz do projeto o "express-rate-limit" com o comando: 

npm install express-rate-limit

importei no arquivo "apiController", defini um máximo de 5 requisições por minuto:

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // Máximo de 10 requisições por IP
    message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
});

Mesmo tentando outras abordagens após, não obtive sucesso em limitar o números de solicitações.

Também tentei instalar algo para fazer o log da aplicação, o pacote "morgan":

npm install morgan

porém, ele também não conseguiu capturar nenhum registro.

