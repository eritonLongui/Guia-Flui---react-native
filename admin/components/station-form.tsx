'use client';

import { useActionState, useState } from 'react';
import { createStation, updateStation, type ActionState } from '@/app/actions/stations';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Conector, Station } from '@/lib/types';

const emptyConnectors: Conector[] = [{ tipo: 'CCS2', potenciaKw: 150, quantidade: 1 }];

export function StationForm({ station }: { station?: Station }) {
  const action = station
    ? updateStation.bind(null, station.id)
    : createStation;
  const [state, formAction, pending] = useActionState(action, undefined as ActionState);
  const [conectores, setConectores] = useState<Conector[]>(station?.conectores?.length ? station.conectores : emptyConnectors);

  return (
    <form action={formAction} className="grid gap-6">
      {state?.error ? (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      ) : null}
      {state?.saved ? (
        <p className="rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">Alterações salvas.</p>
      ) : null}

      <section className="grid gap-4 rounded-2xl border border-border bg-surface p-5 md:grid-cols-2">
        <h2 className="font-heading text-sm font-semibold md:col-span-2">Identidade</h2>
        {!station ? (
          <Field>
            <Label htmlFor="id">ID (opcional)</Label>
            <Input id="id" name="id" placeholder="gerado automaticamente" />
          </Field>
        ) : (
          <Field>
            <Label>ID</Label>
            <Input value={station.id} disabled />
          </Field>
        )}
        <Field className={station ? 'md:col-span-1' : undefined}>
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" name="nome" required defaultValue={station?.nome} />
        </Field>
        <Field className="md:col-span-2">
          <Label htmlFor="imagem_url">URL da imagem</Label>
          <Input id="imagem_url" name="imagem_url" required defaultValue={station?.imagem_url} />
        </Field>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-surface p-5 md:grid-cols-2">
        <h2 className="font-heading text-sm font-semibold md:col-span-2">Local</h2>
        <Field className="md:col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input id="endereco" name="endereco" required defaultValue={station?.endereco} />
        </Field>
        <Field>
          <Label htmlFor="cidade">Cidade</Label>
          <Input id="cidade" name="cidade" required defaultValue={station?.cidade} />
        </Field>
        <Field>
          <Label htmlFor="estado">Estado</Label>
          <Input id="estado" name="estado" required maxLength={2} defaultValue={station?.estado} />
        </Field>
        <Field>
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" name="latitude" type="number" step="any" required defaultValue={station?.latitude ?? -23.55} />
        </Field>
        <Field>
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" name="longitude" type="number" step="any" required defaultValue={station?.longitude ?? -46.63} />
        </Field>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-surface p-5 md:grid-cols-2">
        <h2 className="font-heading text-sm font-semibold md:col-span-2">Operação</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="aberto_agora" defaultChecked={station?.aberto_agora ?? true} className="size-4 accent-accent" />
          Aberto agora
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="carregadores_disponiveis">Carregadores livres</Label>
            <Input
              id="carregadores_disponiveis"
              name="carregadores_disponiveis"
              type="number"
              min={0}
              defaultValue={station?.carregadores_disponiveis ?? 1}
            />
          </Field>
          <Field>
            <Label htmlFor="carregadores_total">Carregadores total</Label>
            <Input id="carregadores_total" name="carregadores_total" type="number" min={0} defaultValue={station?.carregadores_total ?? 2} />
          </Field>
        </div>
        <Field>
          <Label htmlFor="horario_funcionamento">Horário de funcionamento</Label>
          <Input id="horario_funcionamento" name="horario_funcionamento" required defaultValue={station?.horario_funcionamento ?? '24 horas'} />
        </Field>
        <Field>
          <Label htmlFor="horario_menor_movimento">Menor movimento</Label>
          <Input
            id="horario_menor_movimento"
            name="horario_menor_movimento"
            required
            defaultValue={station?.horario_menor_movimento ?? '09:00–11:00'}
          />
        </Field>
        <Field>
          <Label htmlFor="tempo_fila_minutos">Fila (min)</Label>
          <Input id="tempo_fila_minutos" name="tempo_fila_minutos" type="number" min={0} defaultValue={station?.tempo_fila_minutos ?? 10} />
        </Field>
        <Field>
          <Label htmlFor="tempo_carga_minutos">Carga (min)</Label>
          <Input id="tempo_carga_minutos" name="tempo_carga_minutos" type="number" min={0} defaultValue={station?.tempo_carga_minutos ?? 30} />
        </Field>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-surface p-5 md:grid-cols-2">
        <h2 className="font-heading text-sm font-semibold md:col-span-2">Segurança e scores</h2>
        <Field>
          <Label htmlFor="nivel_seguranca">Nível de segurança</Label>
          <select
            id="nivel_seguranca"
            name="nivel_seguranca"
            defaultValue={station?.nivel_seguranca ?? 'moderado'}
            className="h-10 rounded-xl border border-border bg-elevated px-3 text-sm"
          >
            <option value="seguro">Seguro</option>
            <option value="moderado">Moderado</option>
            <option value="atencao">Atenção</option>
          </select>
        </Field>
        <Field>
          <Label htmlFor="pontuacao_seguranca">Pontuação de segurança</Label>
          <Input
            id="pontuacao_seguranca"
            name="pontuacao_seguranca"
            type="number"
            step="0.1"
            defaultValue={station?.pontuacao_seguranca ?? 4}
          />
        </Field>
        <Field className="md:col-span-2">
          <Label htmlFor="descricao_seguranca">Descrição de segurança</Label>
          <Textarea id="descricao_seguranca" name="descricao_seguranca" required defaultValue={station?.descricao_seguranca} />
        </Field>
        <Field>
          <Label htmlFor="nivel_compatibilidade">Nível de compatibilidade (catálogo)</Label>
          <select
            id="nivel_compatibilidade"
            name="nivel_compatibilidade"
            defaultValue={station?.nivel_compatibilidade ?? 'compativel'}
            className="h-10 rounded-xl border border-border bg-elevated px-3 text-sm"
          >
            <option value="compativel">Compatível</option>
            <option value="parcial">Parcial</option>
            <option value="incompativel">Incompatível</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="pontuacao_compatibilidade">Compatibilidade</Label>
            <Input
              id="pontuacao_compatibilidade"
              name="pontuacao_compatibilidade"
              type="number"
              defaultValue={station?.pontuacao_compatibilidade ?? 80}
            />
          </Field>
          <Field>
            <Label htmlFor="pontuacao_recomendacao">Recomendação</Label>
            <Input
              id="pontuacao_recomendacao"
              name="pontuacao_recomendacao"
              type="number"
              defaultValue={station?.pontuacao_recomendacao ?? 80}
            />
          </Field>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-heading text-sm font-semibold">Conveniências</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="tem_comida" defaultChecked={station?.tem_comida} className="size-4 accent-accent" />
            Comida
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="tem_banheiro" defaultChecked={station?.tem_banheiro} className="size-4 accent-accent" />
            Banheiro
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="tem_estacionamento" defaultChecked={station?.tem_estacionamento} className="size-4 accent-accent" />
            Estacionamento
          </label>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-semibold">Conectores</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setConectores((current) => [...current, { tipo: 'CCS2', potenciaKw: 50, quantidade: 1 }])}
          >
            Adicionar
          </Button>
        </div>
        <input type="hidden" name="conectores" value={JSON.stringify(conectores)} />
        <div className="grid gap-3">
          {conectores.map((conector, index) => (
            <div key={`${conector.tipo}-${index}`} className="grid gap-2 rounded-xl border border-border bg-elevated p-3 md:grid-cols-4">
              <Input
                value={conector.tipo}
                placeholder="Tipo"
                onChange={(event) => {
                  const next = [...conectores];
                  next[index] = { ...conector, tipo: event.target.value };
                  setConectores(next);
                }}
              />
              <Input
                type="number"
                value={conector.potenciaKw}
                placeholder="kW"
                onChange={(event) => {
                  const next = [...conectores];
                  next[index] = { ...conector, potenciaKw: Number(event.target.value) };
                  setConectores(next);
                }}
              />
              <Input
                type="number"
                value={conector.quantidade}
                placeholder="Qtd"
                onChange={(event) => {
                  const next = [...conectores];
                  next[index] = { ...conector, quantidade: Number(event.target.value) };
                  setConectores(next);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConectores((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Salvando…' : station ? 'Salvar alterações' : 'Criar eletroposto'}
        </Button>
      </div>
    </form>
  );
}
