import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { MapView } from "@/components/Map";
import { AlertCircle, MapPin } from "lucide-react";

type MapType = "empty" | "markers" | "cluster";

interface LocationMarker {
  id: number;
  lat: number;
  lng: number;
  status: string;
  numeroPedido: string;
  cliente: string;
  endereco: string;
  prazoVencimento: string;
}

export default function MapaOperacional() {
  const { data: pedidos = [] } = trpc.pedidos.list.useQuery();
  const { data: clientes = [] } = trpc.clientes.list.useQuery();

  const [mapType, setMapType] = useState<MapType>("markers");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Converter pedidos em marcadores com coordenadas
  const markers: LocationMarker[] = useMemo(() => {
    return pedidos.map((pedido: any) => {
      const cliente = clientes.find((c: any) => c.id === pedido.clienteId);
      const now = new Date();
      const prazo = new Date(pedido.prazoVencimentoRetirada);
      
      let status = "nao_entregue";
      if (pedido.status === "entregue" || pedido.status === "retirado") {
        if (prazo < now) {
          status = "vencido";
        } else if ((prazo.getTime() - now.getTime()) <= 3 * 24 * 60 * 60 * 1000) {
          status = "alerta";
        } else {
          status = "regular";
        }
      }

      // Buscar coordenadas: 1º do pedido, 2º do cliente, 3º centro do RJ
      const clienteLat = (cliente as any)?.latitude ? parseFloat(String((cliente as any).latitude)) : null;
      const clienteLng = (cliente as any)?.longitude ? parseFloat(String((cliente as any).longitude)) : null;
      const pedidoLat = pedido.latitudeEntrega ? parseFloat(String(pedido.latitudeEntrega)) : null;
      const pedidoLng = pedido.longitudeEntrega ? parseFloat(String(pedido.longitudeEntrega)) : null;

      // Prioridade: pedido > cliente > centro do RJ
      const finalLat = pedidoLat || clienteLat || -22.9068;
      const finalLng = pedidoLng || clienteLng || -43.1729;

      return {
        id: pedido.id,
        lat: finalLat,
        lng: finalLng,
        status,
        numeroPedido: pedido.numeroPedido,
        cliente: cliente?.razaoSocial || "Cliente desconhecido",
        endereco: pedido.enderecoEntrega || "Endereço não informado",
        prazoVencimento: new Date(pedido.prazoVencimentoRetirada).toLocaleDateString('pt-BR'),
      };
    });
  }, [pedidos, clientes]);

  // Filtrar marcadores por status se selecionado
  const filteredMarkers = selectedStatus
    ? markers.filter((m) => m.status === selectedStatus)
    : markers;

  // Contadores por status
  const statusCounts = useMemo(() => ({
    nao_entregue: markers.filter((m) => m.status === "nao_entregue").length,
    regular: markers.filter((m) => m.status === "regular").length,
    alerta: markers.filter((m) => m.status === "alerta").length,
    vencido: markers.filter((m) => m.status === "vencido").length,
  }), [markers]);

  const statusColors: Record<string, { bg: string; text: string; color: string }> = {
    nao_entregue: { bg: "bg-cyan-500", text: "text-white", color: "#06b6d4" },
    regular: { bg: "bg-green-500", text: "text-white", color: "#22c55e" },
    alerta: { bg: "bg-yellow-500", text: "text-white", color: "#eab308" },
    vencido: { bg: "bg-red-500", text: "text-white", color: "#ef4444" },
  };

  const handleMapReady = useCallback((map: any) => {
    setMapInstance(map);

    // Limpar marcadores anteriores
    if (mapInstance && mapInstance.markers) {
      mapInstance.markers.forEach((m: any) => m.setMap(null));
    }

    if (mapType === "markers" && filteredMarkers.length > 0) {
      // Adicionar marcadores individuais
      const bounds = new google.maps.LatLngBounds();
      
      filteredMarkers.forEach((marker) => {
        const markerColor = statusColors[marker.status]?.color || "#06b6d4";
        
        const markerObj = new google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
          map: map,
          title: marker.numeroPedido,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: markerColor,
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });

        // Info window ao clicar
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; font-family: Arial; font-size: 12px;">
              <strong>${marker.numeroPedido}</strong><br/>
              Cliente: ${marker.cliente}<br/>
              Endereço: ${marker.endereco}<br/>
              Prazo: ${marker.prazoVencimento}<br/>
              Status: <span style="color: ${markerColor}; font-weight: bold;">${marker.status}</span>
            </div>
          `,
        });

        markerObj.addListener("click", () => {
          infoWindow.open(map, markerObj);
        });

        bounds.extend({ lat: marker.lat, lng: marker.lng });
      });

      // Ajustar zoom para mostrar todos os marcadores
      if (filteredMarkers.length > 0) {
        map.fitBounds(bounds);
      }
    } else if (mapType === "cluster" && filteredMarkers.length > 0) {
      // Implementar clustering simples
      const clusters: Record<string, LocationMarker[]> = {};
      const gridSize = 0.05; // Tamanho da célula do grid

      filteredMarkers.forEach((marker) => {
        const gridLat = Math.floor(marker.lat / gridSize) * gridSize;
        const gridLng = Math.floor(marker.lng / gridSize) * gridSize;
        const key = `${gridLat},${gridLng}`;

        if (!clusters[key]) clusters[key] = [];
        clusters[key].push(marker);
      });

      // Criar marcadores de cluster
      const bounds = new google.maps.LatLngBounds();
      
      Object.entries(clusters).forEach(([_, clusterMarkers]) => {
        const avgLat = clusterMarkers.reduce((sum, m) => sum + m.lat, 0) / clusterMarkers.length;
        const avgLng = clusterMarkers.reduce((sum, m) => sum + m.lng, 0) / clusterMarkers.length;

        new google.maps.Marker({
          position: { lat: avgLat, lng: avgLng },
          map: map,
          title: `${clusterMarkers.length} locações`,
          label: {
            text: clusterMarkers.length.toString(),
            color: "white",
            fontSize: "14px",
            fontWeight: "bold",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 20,
            fillColor: "#3b82f6",
            fillOpacity: 0.8,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });

        bounds.extend({ lat: avgLat, lng: avgLng });
      });

      // Ajustar zoom
      if (Object.keys(clusters).length > 0) {
        map.fitBounds(bounds);
      }
    } else if (mapType === "empty") {
      // Apenas mostrar o mapa vazio - Centro do RJ
      map.setCenter({ lat: -22.9068, lng: -43.1729 });
      map.setZoom(12);
    }
  }, [mapType, filteredMarkers, statusColors, mapInstance]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mapa Operacional</h1>
          <p className="text-muted-foreground mt-2">
            Visualize a localização de suas caçambas em tempo real
          </p>
        </div>
      </div>

      {/* Controles de Tipo de Mapa */}
      <Card className="bg-blue-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">ALTERAR TIPO DE MAPA</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={mapType === "empty" ? "default" : "outline"}
                size="sm"
                onClick={() => setMapType("empty")}
                className={mapType === "empty" ? "bg-white text-blue-600 hover:bg-white" : "text-white border-white hover:bg-blue-700"}
              >
                Vazio
              </Button>
              <Button
                variant={mapType === "markers" ? "default" : "outline"}
                size="sm"
                onClick={() => setMapType("markers")}
                className={mapType === "markers" ? "bg-white text-blue-600 hover:bg-white" : "text-white border-white hover:bg-blue-700"}
              >
                Alfinetes
              </Button>
              <Button
                variant={mapType === "cluster" ? "default" : "outline"}
                size="sm"
                onClick={() => setMapType("cluster")}
                className={mapType === "cluster" ? "bg-white text-blue-600 hover:bg-white" : "text-white border-white hover:bg-blue-700"}
              >
                Agrupamento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="bg-cyan-500 text-white rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedStatus(selectedStatus === "nao_entregue" ? null : "nao_entregue")}
        >
          <div className="text-3xl font-bold">{statusCounts.nao_entregue}</div>
          <div className="text-sm font-semibold">Não Entregue</div>
        </div>

        <div
          className="bg-green-500 text-white rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedStatus(selectedStatus === "regular" ? null : "regular")}
        >
          <div className="text-3xl font-bold">{statusCounts.regular}</div>
          <div className="text-sm font-semibold">Regular</div>
        </div>

        <div
          className="bg-yellow-500 text-white rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedStatus(selectedStatus === "alerta" ? null : "alerta")}
        >
          <div className="text-3xl font-bold">{statusCounts.alerta}</div>
          <div className="text-sm font-semibold">Alerta</div>
        </div>

        <div
          className="bg-red-500 text-white rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedStatus(selectedStatus === "vencido" ? null : "vencido")}
        >
          <div className="text-3xl font-bold">{statusCounts.vencido}</div>
          <div className="text-sm font-semibold">Vencido</div>
        </div>
      </div>

      {/* Mapa */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full h-96 md:h-[600px] bg-gray-200 rounded-lg overflow-hidden">
            {pedidos.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Nenhuma locação registrada para exibir no mapa</p>
                </div>
              </div>
            ) : (
              <MapView onMapReady={handleMapReady} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Locações */}
      <Card>
        <CardHeader>
          <CardTitle>Locações {selectedStatus ? `- ${selectedStatus}` : ""} ({filteredMarkers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMarkers.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma locação encontrada</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredMarkers.map((marker) => (
                <div
                  key={marker.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div
                    className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 ${statusColors[marker.status]?.bg}`}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{marker.numeroPedido}</p>
                    <p className="text-xs text-muted-foreground">{marker.cliente}</p>
                    <p className="text-xs text-muted-foreground">{marker.endereco}</p>
                    <p className="text-xs text-muted-foreground">Prazo: {marker.prazoVencimento}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${statusColors[marker.status]?.bg} ${statusColors[marker.status]?.text}`}
                  >
                    {marker.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
