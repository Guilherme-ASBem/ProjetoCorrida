const express = require("express");
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

// Diretório público para servir os arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para processar os dados do log e renderizar a página
app.get('/', async (req, res) => {
    try {
        const data = await fs.readFile('public/log_corrida.txt', 'utf8');
        const linhas = data.split('\n').slice(1); // Ignora a primeira linha

        // Processar os dados
        const pilotos = {};
        linhas.forEach(linha => {
            const [hora, codigo, nome, volta, tempoVolta] = linha.split(' ');
            if (!pilotos[codigo]) {
                pilotos[codigo] = {
                    codigo,
                    nome: nome.replace('–', ''), // Remove o hífen do nome
                    voltas: [],
                    tempoTotal: 0
                };
            }
            pilotos[codigo].voltas.push(parseFloat(tempoVolta.replace(':', '.')));
            pilotos[codigo].tempoTotal += parseFloat(tempoVolta.replace(':', '.'));
        });

        // Ordenar os pilotos pela posição final
        const classificacao = Object.values(pilotos).sort((a, b) => {
            if (a.voltas !== b.voltas) {
                return b.voltas - a.voltas;
            } else {
                return a.tempoTotal - b.tempoTotal;
            }
        });

        // Atribuir posições
        classificacao.forEach((piloto, index) => {
            piloto.posicao = index + 1;
        });

        // Funções adicionais
        function melhorVoltaPiloto(piloto) {
            return Math.min(...piloto.voltas);
        }
        
        function melhorVoltaCorrida(pilotos) {
            return Math.min(...Object.values(pilotos).map(piloto => melhorVoltaPiloto(piloto)));
        }
        
        function velocidadeMediaPiloto(piloto, distanciaPista) {
            const tempoTotal = piloto.tempoTotal;
            const numeroVoltas = piloto.voltas.length;
            return (distanciaPista * numeroVoltas) / tempoTotal;
        }
        
        function tempoAtraso(piloto, primeiroColocado) {
            return piloto.tempoTotal - primeiroColocado.tempoTotal;
        }

        // Renderizar a tabela (pode usar um template engine como EJS)
        res.send(`
            <table style="border-radius: 10px;border: 1px solid black;box-shadow: 0 5px 10px rgba(0,0,0,0.2);">
                <thead>
                    <tr>
                        <th style="padding:12px">Posição</th>
                        <th style="padding:12px">Código</th>
                        <th style="padding:12px">Nome</th>
                        <th style="padding:12px">Voltas</th>
                        <th style="padding:12px">Tempo Total</th>
                        <th style="padding:12px">Melhor Volta</th>
                        <th style="padding:12px">Velocidade media</th>
                        <th style="padding:12px">Atraso</th>
                    </tr>
                </thead>
                <tbody>
                ${classificacao.map(piloto => {
                    const melhorVolta = melhorVoltaPiloto(piloto);
                    const velocidadeMedia = velocidadeMediaPiloto(piloto, 4.304); // Exemplo: distância da pista em km
                    const atraso = tempoAtraso(piloto, classificacao[0]);
                    return `
                        <tr>
                            <td style="font-weight: bold;background-color: #f2f2f2;">${piloto.posicao}</td>
                            <td style="font-weight: bold;background-color: #f2f2f2;">${piloto.codigo}</td>
                            <td style="font-weight: bold;background-color: #f2f2f2;">${piloto.nome}</td>
                            <td style="font-weight: bold;background-color: #f2f2f2;">${piloto.voltas}</td>
                            <td style="font-weight: bold;background-color: #f2f2f2;">${piloto.tempoTotal.toFixed(3)}</td>
                            <td style="font-weight: bold;background-color: #f2f2f2;">${melhorVolta.toFixed(3)}</td>
                            <td style="font-weight: bold;background-color: #f2f2f2;">${velocidadeMedia.toFixed(2)} km/h</td>
                            <td style="font-weight: bold;background-color: #f2f2f2;">${atraso.toFixed(3)}</td>
                        </tr>
                    `;
                }).join('')}
                </tbody>
            </table>
        `);
    } catch (error) {
        console.error('Erro ao ler o arquivo:', error);
        res.status(500).send('Erro ao processar os dados');
    }


});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});