<?php
// Nome do arquivo de log
$arquivo_log = 'public/log_corrida.txt';

// Função para processar o log e retornar os resultados
function processar_log($arquivo) {
    $dados = file($arquivo);
    $pilotos = [];

    // Ignora a primeira linha (cabeçalho)
    array_shift($dados);

    // Processa cada linha
    foreach ($dados as $linha) {
        list($hora, $codigo, $nome, $volta, $tempoVolta) = explode(' ', $linha);
        $tempoVolta = floatval(str_replace(':', '.', $tempoVolta)); // Converte tempo para float

        if (!isset($pilotos[$codigo])) {
            $pilotos[$codigo] = [
                'nome' => trim($nome, '-'),
                'voltas' => [],
                'tempo_total' => 0,
                'melhor_volta' => null
            ];
        }

        $pilotos[$codigo]['voltas'][] = $tempoVolta;
        $pilotos[$codigo]['tempo_total'] += $tempoVolta;
        $pilotos[$codigo]['melhor_volta'] = min($pilotos[$codigo]['melhor_volta'] ?? PHP_FLOAT_MAX, $tempoVolta);
    }

    // Calcula a melhor volta da corrida
    $melhor_volta_corrida = PHP_FLOAT_MAX;
    foreach ($pilotos as $piloto) {
        $melhor_volta_corrida = min($melhor_volta_corrida, $piloto['melhor_volta']);
    }

    // Ordena os pilotos por número de voltas e tempo total
    usort($pilotos, function ($a, $b) {
        if (count($a['voltas']) != count($b['voltas'])) {
            return count($b['voltas']) - count($a['voltas']);
        } else {
            return $a['tempo_total'] - $b['tempo_total'];
        }
    });

    // Atribui posições e calcula outras métricas
    $posicao = 1;
    foreach ($pilotos as &$piloto) {
        $piloto['posicao'] = $posicao++;
        // Calcular velocidade média, tempo de atraso, etc.
    }

    return $pilotos;
}

// Chama a função e obtém os resultados
$resultados = processar_log($arquivo_log);



// Função para gerar a tabela HTML
function gerar_tabela($resultados) {
    echo '<table>';
    echo '<thead>';
    echo '<tr>';
    echo '<th>Posição</th>';
    echo '<th>Piloto</th>';
    echo '<th>Voltas</th>';
    echo '<th>Tempo Total</th>';
    echo '<th>Melhor Volta</th>';
    echo '<th>Velocidade Média</th>';
    echo '<th>Atraso</th>';
    echo '</tr>';
    echo '</thead>';
    echo '<tbody>';

    foreach ($resultados as $piloto) {
        // Bonus
        $distancia_pista = 4.304; // Exemplo: distância da pista em km
        $velocidade_media = ($distancia_pista * count($piloto['voltas'])) / $piloto['tempo_total'];
        $atraso = $piloto['tempo_total'] - $resultados[0]['tempo_total'];
        echo '<tr>';
        echo '<td>' . $piloto['posicao'] . '</td>';
        echo '<td>' . $piloto['nome'] . '</td>';
        echo '<td>' . count($piloto['voltas']) . '</td>';
        echo '<td>' . $piloto['tempo_total'] . '</td>';
        echo '<td>' . $piloto['melhor_volta'] . '</td>';
        echo '<td>' . number_format($velocidade_media, 2) . ' km/h</td>';
        echo '<td>' . number_format($atraso, 2) . '</td>';
        echo '</tr>';
    }

    echo '</tbody>';
    echo '</table>';
}

// Chama a função para gerar a tabela
gerar_tabela($resultados);
?>