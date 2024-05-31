/**
 * {
 *  nome: ''
 *  autor: ''
 *  genero: ''
 *  anoPublicacao: ''
 * personagens: [personagem1, 2, 3, 4]
 * }
 */

import http from 'node:http'
import fs from 'node:fs'

const PORT = 3333

const server = http.createServer((request, response)=>{
    const {method,url} = request

    if(method === 'GET' && url === '/livros'){
        fs.readFile('livros.json', 'utf8', (err, data)=>{
            if(err){
                response.writeHead(500, {'Content-Type' : 'application/json'});
                response.end(JSON.stringify(data));
                return;
            }
            response.writeHead(200, {'Content-Type' : 'application/json'});
            response.end(JSON.stringify(data));
        });
        //http://localhost:3333/livros
    } else if(method === 'POST' && url === '/livros'){
        let body = '';
        request.on('data', (chunk)=>{
            body += chunk;
        });
        request.on('end', ()=> {
            const novoLivro = JSON.parse(body);
            fs.readFile('livros.json', 'utf8', (err, data)=>{
                if(err) {
                    response.writeHead(500, {"Content-Type" : "application/json"});
                    response.end(JSON.stringify({message: "Não foi possivel acessar os dados"}));
                    return;
                }
                const livros = JSON.parse(data)
                novoLivro.id = livros.length + 1
                livros.push(novoLivro)
                
                fs.writeFile('livros.json', JSON.stringify(livros, null, 2), (err)=>{
                    if (err) {
                        response.writeHead(500,{"Content-Type" : "application/json"});
                        response.end(JSON.stringify({message: 'Arquivo não encontrado'}));
                        return;
                    }
                    response.writeHead(201, {"Content-Type" : "application/json"});
                    response.end(JSON.stringify(novoLivro));
                })
            });
        });
    } else if(method === 'PUT' && url.startsWith('/livros/')){
        //1º receber dados da URL /livros/{id}
        //2º receber dados pelo corpo da aplicação: request.on
        const id = parseInt(url.split('/')[2]);

        let body = '';
        request.on('data', (chunk)=>{
            body += chunk;
        });
        request.on('end', ()=>{
            const livroAtualizado = JSON.parse(body);
            fs.readFile('Livros.json', "utf8", (err, data)=>{
                if(err){
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify({message: "não foi possivel ler o arquivo"}));
                    return;
                }
                const livros = JSON.parse(data)

                const indexLivro = livros.findIndex((livro)=>livro.id === id)
                if(indexLivro === -1){
                    response.writeHead(400, {'Content-Type':'application/json'});
                    response.end(JSON.stringify({message: "Livro não encontrado"}));
                    return;
                }

                livros[indexLivro] = {...livros[indexLivro], ...livroAtualizado};
                
                fs.writeFile('livros.json', JSON.stringify(livros, null, 2), (err)=>{
                    if(err){response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify({message: "Arquivo não encontrado"}));
                    return;        
                    }
                response.writeHead(200, {'Content-Type': 'application/json'}); 
                response.end(JSON.stringify(livroAtualizado))
                })
            });
        });
    } else if(method === 'DELETE' && url.startsWith('/livros/')){
        // Receber um valor na URL /livros/{id}
        const id = parseInt(url.split('/')[2])
        fs.readFile('livros.json', 'utf8', (err, data)=>{
            if(err){
                response.writeHead(500, {"Content-Type" : "application/json"});
                response.end(JSON.stringify({message: 'Não é possivel acessar o arquivo'}));
                return;
            }
            const livros = JSON.parse(data)
            const indexLivro = livros.findIndex((livros)=>livros.id === id)
            // console.log(encontrarLivro) //* V - indice que elemento está | F - -1 // method findIndex
            if(indexLivro === -1){
                response.writeHead(400, {"Content-Type" : "application/json"});
                response.end(JSON.stringify({message: 'Livro não encontrado'}));
                return;
            }
            // console.log(livros)
            livros.splice(indexLivro, 1)
            // console.log(livros)
            fs.writeFile('livros.json', JSON.stringify(livros, null, 2), (err)=>{
                if(err){
                    response.writeHead(500, {"Content-Type" : "application/json"});
                    response.end(JSON.stringify({message: 'Não é possivel escrever no arquivo'}));
                    return;
                }
                response.writeHead(200, {"Content-Type" : "application/json"});
                response.end(JSON.stringify({message: 'Livro excluído'}));
            });
        });
    } else if(method === 'GET' && url.startsWith('/livros/')){
        const id = parseInt(url.split('/')[2])
        console.log(id)
        fs.readFile('livros.json', 'utf8', (err, data)=>{
            if(err){
                response.writeHead(500, {"Content-Type" : "application/json"});
                response.end(JSON.stringify({message: "Erro ao pesquisar o arquivo"}));
                return;
            }
            const livros = JSON.parse(data)
            
            const encontrarLivro = livros.find((livro) => livro.id === id)
            // console.log(encontrarLivro) //* V trás o livro | F - undefined
            if(!encontrarLivro){
                response.writeHead(400, {"Content-Type" : "application/json"});
                response.end(JSON.stringify({message: "Livro não encontrado"}));
                return;
            }

            // console.log(livros)
            response.writeHead(200, {"Content-Type" : "application/json"})
            response.end(JSON.stringify(encontrarLivro))
        })

    } else {
        response.writeHead(404, {'Content-Type' : 'application/json'});
        response.end(JSON.stringify({ message: "Página não encontrada"}));
    }
});

server.listen(PORT, ()=>{
    console.log(`Servidor on http://localhost:${PORT}`);
})