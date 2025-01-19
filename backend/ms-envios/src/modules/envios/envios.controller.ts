import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EnviosService } from './envios.service';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { UpdateEnvioDto } from './dto/update-envio.dto';

@Controller()
export class EnviosController {
  constructor(private readonly enviosService: EnviosService) {}

  @MessagePattern('createEnvio')
  create(@Payload() createEnvioDto: CreateEnvioDto) {
    return this.enviosService.create(createEnvioDto);
  }

  @MessagePattern('findAllEnvios')
  findAll() {
    return this.enviosService.findAll();
  }

  @MessagePattern('findOneEnvio')
  findOne(@Payload() id: number) {
    return this.enviosService.findOne(id);
  }

  @MessagePattern('updateEnvio')
  update(@Payload() updateEnvioDto: UpdateEnvioDto) {
    return this.enviosService.update(updateEnvioDto.id, updateEnvioDto);
  }

  @MessagePattern('removeEnvio')
  remove(@Payload() id: number) {
    return this.enviosService.remove(id);
  }
}
